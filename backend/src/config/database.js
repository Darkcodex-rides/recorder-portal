
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool.on("connect", () => {
  console.log("Connected to PostgreSQL");
});

pool.on("error", (error) => {
  console.error(
    "Unexpected PostgreSQL error:",
    error
  );
});

module.exports = pool;


