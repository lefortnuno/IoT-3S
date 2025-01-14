"use strict";
const Simulation = require("../models/simulation.model");

module.exports.placeAuGlitch = async (req, res) => {
  try {
    const result = await Simulation.db_initialisation(); //Auto BdD
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.add = async (req, res) => {
  let data = req.body;

  const newData = {
    u_id: data.u_id,
    temperature: data.c,
    heart_rate: data.bpm,
    pression: data.spo2,
  };

  try {
    const result = await Simulation.add(newData);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const result = await Simulation.getAllUsers();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.getUser = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await Simulation.getUser({ id });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.getStatValue = async (req, res) => {
  const id = req.params.id;
  const date = req.query.date;

  if (!id || !date) {
    return res.status(400).send({ error: "Missing id or date" });
  }

  try {
    const result = await Simulation.getStatValue({ id, date });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.getAll = async (req, res) => {
  const id = req.params.id;
  const date = req.query.date;

  if (!id || !date) {
    return res.status(400).send({ error: "Missing id or date" });
  }

  try {
    const result = await Simulation.getAll({ id, date });
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};
