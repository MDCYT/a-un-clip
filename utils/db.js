const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

connection.query('CREATE DATABASE IF NOT EXISTS ' + process.env.MYSQL_DATABASE, (err) => {
    if (err) throw err;
    console.log('Database created');
});

connection.query('USE ' + process.env.MYSQL_DATABASE, (err) => {
    if (err) throw err;
    console.log('Using database');
});

//Create the databse users table if it doesn't exist
connection.query('CREATE TABLE IF NOT EXISTS users (id VARCHAR(36) PRIMARY KEY, username VARCHAR(255) NOT NULL, password TEXT NOT NULL, level INT NOT NULL)', (err) => {
    if (err) throw err;
    console.log('Table users created');
});

module.exports = connection;