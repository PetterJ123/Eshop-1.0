USE eshop;
-- Creates a new user named 'user' (if it doesn't exist)
CREATE USER IF NOT EXISTS 'user'@'%'
    IDENTIFIED WITH mysql_native_password
    BY 'pass'
;

-- Grants all privileges to the user named 'user'
GRANT ALL PRIVILEGES
    ON eshop
    TO 'user'@'%'
;

-- If it doesn't exist, create the database 'eshop'
CREATE DATABASE IF NOT EXISTS eshop;
