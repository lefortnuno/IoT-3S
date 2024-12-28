"use strict";
const Simulation = require("../models/simulation.model");

module.exports.add = async (req, res) => {
  let data = req.body;

  const newData = {
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

module.exports.getAll = async (req, res) => {
  try {
    const result = await Simulation.getAll();
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports.placeAuGlitch = async (req, res) => {
  try {
    const result = await Simulation.db_initialisation(); //Auto BdD
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send(error);
  }
};
