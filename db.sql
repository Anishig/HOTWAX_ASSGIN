CREATE DATABASE ecommerce;
USE ecommerce;

CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE Customer (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL
);

CREATE TABLE Contact_Mech (
    contact_mech_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    street_address VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    phone_number VARCHAR(20) NULL,
    email VARCHAR(100) NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

CREATE TABLE Product (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    color VARCHAR(30) NULL,
    size VARCHAR(10) NULL
);

CREATE TABLE Order_Header (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_date DATE NOT NULL,
    customer_id INT NOT NULL,
    shipping_contact_mech_id INT NOT NULL,
    billing_contact_mech_id INT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (shipping_contact_mech_id) REFERENCES Contact_Mech(contact_mech_id),
    FOREIGN KEY (billing_contact_mech_id) REFERENCES Contact_Mech(contact_mech_id)
);

CREATE TABLE Order_Item (
    order_item_seq_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Order_Header(order_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);
