let dbConn = require("../config/db");

let Simulation = function (simulation) {
  this.id = simulation.id;
};

Simulation.db_initialisation = async () => {
  try {
    const users = await dbConn.query(`
      CREATE TABLE IF NOT EXISTS users (
          u_id SERIAL PRIMARY KEY,
          nom varchar(25),
          prenom varchar(100),
          date_naiss date,
          sexe boolean DEFAULT true, 
          sante boolean DEFAULT true,
          adress varchar(50),
          email varchar(50)
      )
    `);
    const simulations = await dbConn.query(`
      CREATE TABLE IF NOT EXISTS simulations (
          id SERIAL PRIMARY KEY,
          u_id INT,
          temperature FLOAT DEFAULT NULL,
          heart_rate INT DEFAULT NULL,
          pression INT DEFAULT NULL,
          coms VARCHAR(150) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT fk_users FOREIGN KEY ("u_id") REFERENCES users(u_id) ON DELETE CASCADE
      )
    `);
    const appareils = await dbConn.query(`
      CREATE TABLE IF NOT EXISTS appareils (
          id SERIAL PRIMARY KEY,
          libelle VARCHAR(50) NOT NULL,
          spec VARCHAR(50) DEFAULT NULL,
          etat BOOLEAN DEFAULT true, 
          u_id INT UNIQUE,
          CONSTRAINT fk_users_appareil FOREIGN KEY (u_id) REFERENCES users(u_id) ON DELETE SET NULL
      )
    `);

    return "Glitch";
  } catch (error) {
    console.error("Erreur d'initialisation:", error);
    throw error;
  }
};

Simulation.add = async (newData) => {
  try {
    const query = `INSERT INTO simulations ("u_id", "temperature", "heart_rate", "pression") VALUES ($1, $2, $3, $4)`;

    const result = await dbConn.query(query, [
      newData.u_id,
      newData.temperature,
      newData.heart_rate,
      newData.pression,
    ]); 

    return result;
  } catch (error) {
    throw error;
  }
};

Simulation.addUser = async (newData) => {
  try {
    const query = `INSERT INTO users ( nom, prenom, date_naiss, sexe, adress, email ) VALUES ($1, $2, $3, $4, $5, $6)`;

    const result = await dbConn.query(query, [
      newData.nom,
      newData.prenom,
      newData.date_naiss,
      newData.sexe,
      newData.adress,
      newData.email,
    ]);

    return result;
  } catch (error) {
    throw error;
  }
};

Simulation.getAllUsers = async () => {
  try {
    const result = await dbConn.query(
      "SELECT * FROM users INNER JOIN appareils ON users.u_id = appareils.u_id ORDER BY users.u_id DESC"
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
};

Simulation.getUser = async (value) => {
  try {
    const result = await dbConn.query("SELECT * FROM users INNER JOIN appareils ON users.u_id = appareils.u_id WHERE users.u_id = $1", [
      value.id,
    ]);

    return result.rows;
  } catch (error) {
    throw error;
  }
};

Simulation.getAll = async (values) => {
  try {
    const result = await dbConn.query(
      `SELECT * FROM simulations 
        WHERE u_id = $1
        AND created_at >= $2 
        AND created_at < $2::DATE + INTERVAL '1 day' ORDER BY id DESC`,
      [values.id, values.date]
    );
    // const result = await dbConn.query(
    //   `SELECT * FROM simulations
    //     WHERE u_id = $1 ORDER BY id DESC`,
    //   [values.id]
    // );

    return result.rows;
  } catch (error) {
    throw error;
  }
};

Simulation.getStatValue = async (values) => {
  try {
    const result = await dbConn.query(
      `SELECT 
        MAX(temperature) as max_t, 
        MAX(heart_rate) as max_h, 
        MAX(pression) as max_p, 
        MIN(temperature) as min_t,  
        ABS(MIN(heart_rate)) as min_h, 
        MIN(pression) as min_p, 
        CAST(AVG(temperature) AS FLOAT) as avg_t,  
        CAST(AVG(heart_rate) AS FLOAT) as avg_h,  
        CAST(AVG(pression) AS FLOAT) as avg_p
      FROM simulations 
      INNER JOIN users ON users.u_id = simulations.u_id 
      WHERE users.u_id = $1 
        AND created_at >= $2 
        AND created_at < $2::DATE + INTERVAL '1 day'`,
      [values.id, values.date]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
};

module.exports = Simulation;
