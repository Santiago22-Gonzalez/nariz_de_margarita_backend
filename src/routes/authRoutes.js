const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/registro", authController.registro);
router.post("/login", authController.login);

//get -> consultas
//post -> crear
//put -> actualizar
//delete -> eliminar

module.exports = router;
