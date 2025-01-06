let dbConn = require("../config/db");

let Simulation = function (simulation) {
  this.id = simulation.id;
};

Simulation.add = async (newData) => {
  try {
    const query = `INSERT INTO simulations ("temperature", "heart_rate", "pression") VALUES ($1, $2, $3)`;

    const result = await dbConn.query(query, [
      newData.temperature,
      newData.heart_rate,
      newData.pression,
    ]);
    return result;
  } catch (error) {
    throw error;
  }
};

Simulation.getAll = async (result) => {
  try {
    const result = await dbConn.query(
      "SELECT * FROM simulations ORDER BY id DESC"
    );
    console.log(result.rows[0]);

    return result.rows;
  } catch (error) {
    throw error;
  }
};

Simulation.db_initialisation = async () => {
  try {
    const result = await dbConn.query(`
      CREATE TABLE IF NOT EXISTS simulations (
        id SERIAL PRIMARY KEY,
        temperature FLOAT DEFAULT NULL,
        heart_rate INT DEFAULT NULL,
        pression INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // console.log("Table simulations créée avec succès");
    return "Glitch";
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    throw error;
  }
};

module.exports = Simulation;
