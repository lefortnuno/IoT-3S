const router = require("express").Router();
const SimulationController = require("../controllers/simulation.controller");

router.post("/", SimulationController.add);

router.get("/", SimulationController.getAll);
router.get("/glitch/", SimulationController.placeAuGlitch);

module.exports = router;
