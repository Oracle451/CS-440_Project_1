-- Create the database
CREATE DATABASE BlogPostApp;

-- Use the database (MySQL / SQL Server)
USE BlogPostApp;

-- Create the users table
CREATE TABLE users (
    user_id INT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- Create the blogs table
CREATE TABLE blogs (
    blog_id INT PRIMARY KEY,
    creator_name VARCHAR(100) NOT NULL,
    creator_user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    FOREIGN KEY (creator_user_id) REFERENCES users(user_id)
);