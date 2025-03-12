const express = require("express");
const mysql = require("mysql2/promise");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const JWT_SECRET = process.env.JWT_SECRET;


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Access denied" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};


app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();
    
    await connection.execute(
      `INSERT INTO Users (username, password) VALUES (?, ?)`,
      [username, hashedPassword]
    );

    connection.release();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const [users] = await pool.execute(
      `SELECT * FROM Users WHERE username = ?`,
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ user_id: user.user_id, username: user.username }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});




app.post("/orders", authenticateToken, async (req, res) => {
  const { order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id, order_items } = req.body;

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    const [orderResult] = await connection.execute(
      `INSERT INTO Order_Header (order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id)
       VALUES (?, ?, ?, ?)`,
      [order_date, customer_id, shipping_contact_mech_id, billing_contact_mech_id]
    );

    const order_id = orderResult.insertId;

    for (const item of order_items) {
      await connection.execute(
        `INSERT INTO Order_Item (order_id, product_id, quantity, status)
         VALUES (?, ?, ?, ?)`,
        [order_id, item.product_id, item.quantity, item.status]
      );
    }

    await connection.commit();
    connection.release();

    res.status(201).json({ message: "Order created successfully", order_id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/orders/:order_id", authenticateToken, async (req, res) => {
  const { order_id } = req.params;

  try {
    const [orderDetails] = await pool.execute(
      `SELECT * FROM Order_Header WHERE order_id = ?`,
      [order_id]
    );

    if (orderDetails.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [orderItems] = await pool.execute(
      `SELECT * FROM Order_Item WHERE order_id = ?`,
      [order_id]
    );

    res.json({ order: orderDetails[0], items: orderItems });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.put("/orders/:order_id", authenticateToken, async (req, res) => {
  const { order_id } = req.params;
  const { shipping_contact_mech_id, billing_contact_mech_id } = req.body;

  try {
    await pool.execute(
      `UPDATE Order_Header 
       SET shipping_contact_mech_id = ?, billing_contact_mech_id = ?
       WHERE order_id = ?`,
      [shipping_contact_mech_id, billing_contact_mech_id, order_id]
    );

    res.json({ message: "Order updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.delete("/orders/:order_id", authenticateToken, async (req, res) => {
  const { order_id } = req.params;

  try {
    await pool.execute(`DELETE FROM Order_Item WHERE order_id = ?`, [order_id]);
    await pool.execute(`DELETE FROM Order_Header WHERE order_id = ?`, [order_id]);

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
