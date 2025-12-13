const express = require("express");
const router = express.Router();
const compraController = require("../controllers/compraController");
const verificarToken = require("../models/authToken");

router.post("/", verificarToken, compraController.crearCompra);

module.exports = router;
