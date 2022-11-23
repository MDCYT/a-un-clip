const mysql = require('mysql');
const { promisify } = require("util");

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
});

pool.getConnection((err, connection) => {
    if(err) {
        if (err.code === "PROTOCOL_CONNECTION_LOST"){
            console.error("Conexion con la base de datos cerrada")
        }
        if (err.code === "ER_CON_COUNT_ERROR"){
            console.error("La base de datos tiene muchas conexiones")
        }
        if (err.code === "ECONEFUSED"){
            console.error("La conexion a la base de datos fue rechazada")
        }
    }

    if (connection) connection.release();
    console.log("La BD a sido conectada correctamente")
    return;
})

// Promisify for Node.js async/await.
pool.query = promisify(pool.query);

//Create the databse users table if it doesn't exist
pool.query('CREATE TABLE IF NOT EXISTS users (id VARCHAR(36) PRIMARY KEY, username VARCHAR(255) NOT NULL, password TEXT NOT NULL, level INT NOT NULL)', (err) => {
    if (err) throw err;
    console.log('Table users created');
});

module.exports = pool;