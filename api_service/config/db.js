// db.js
const { Pool } = require("pg");

const dbConn = new Pool({
  host: process.env.SUN_DB_HOST,
  user: process.env.SUN_DB_USER,
  password: process.env.SUN_DB_MDP,
  database: process.env.SUN_DB_NAME,
  port: process.env.SUN_DB_PORT,
  max: 10, 
  idleTimeoutMillis: 30000, 
});

dbConn
  .connect()
  .then(() => {
    console.log(
      `Connexion à la base de données '${process.env.SUN_DB_NAME}' réussie.`
    );
  })
  .catch((err) => {
    console.error("Erreur de connexion à la base de données :", err);
  });

module.exports = dbConn;
