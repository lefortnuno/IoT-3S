const router = require("express").Router();
const SimulationController = require("../controllers/simulation.controller");

router.post("/", SimulationController.add);

router.get("/", SimulationController.getAllUsers);
router.get("/glitch/", SimulationController.placeAuGlitch);
router.get("/user/:id", SimulationController.getUser);
router.get("/stat/:id", SimulationController.getStatValue);
router.get("/vitals/:id", SimulationController.getAll);


module.exports = router;
