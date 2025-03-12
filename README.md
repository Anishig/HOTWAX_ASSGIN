# 🛒 E-commerce API with JWT Authentication  

This is a **secure E-commerce API** built with **Node.js, Express.js, and MySQL**. It includes **JWT-based authentication** to protect API endpoints. Users can **register, log in, and manage orders securely**.  

---

## **📌 Features**  
✅ **User Authentication**: Register & login with hashed passwords (bcrypt.js)  
✅ **JWT Security**: All order-related endpoints require a valid token  
✅ **Order Management**: Create, update, delete, and retrieve orders  
✅ **Order Items Management**: Add, update, and remove items from orders  
✅ **MySQL Database**: Stores users, customers, products, and orders  

---

## **📂 Project Structure**  
```plaintext
/ecommerce-api
│-- server.js       # Main API file  
│-- .env            # Environment variables  
│-- db.sql          # MySQL database schema  
│-- package.json    # Dependencies & scripts  
│-- README.md       # Project documentation  
