const mysql = require('mysql');

const connection = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE
});

connection.getConnection((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Server!');
});

//Create the databse users table if it doesn't exist
connection.query('CREATE TABLE IF NOT EXISTS users (id VARCHAR(36) PRIMARY KEY, username VARCHAR(255) NOT NULL, password TEXT NOT NULL, level INT NOT NULL)', (err) => {
    if (err) throw err;
    console.log('Table users created');
});

module.exports = connection;