const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "ATM_DB",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL Database!");
});

module.exports = connection;
