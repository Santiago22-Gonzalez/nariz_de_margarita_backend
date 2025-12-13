const express = require("express");
const router = express.Router();
const productoController = require("../controllers/productoController");
const upload = require("../models/upload");
const verificarToken = require("../models/authToken");

router.post(
  "/",
  verificarToken,
  upload.single("imagen"),
  productoController.crearProducto
);
router.get("/", productoController.listarProductos);

module.exports = router;
