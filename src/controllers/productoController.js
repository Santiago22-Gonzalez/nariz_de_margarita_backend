const prisma = require("../models/db");
const path = require("path");

exports.crearProducto = async (req, res) => {
  try {
    const { nombre, precio, descuento, tipo, cantidad } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "La imagen es requerida" });
    }

    const imagenUrl = `/uploads/${req.file.filename}`;

    const nuevoProducto = await prisma.producto.create({
      data: {
        nombre,
        imagen: imagenUrl,
        precio: parseFloat(precio),
        descuento: descuento ? parseFloat(descuento) : 0,
        tipo,
        cantidad: parseInt(cantidad),
      },
    });

    res.status(201).json(nuevoProducto);
  } catch (error) {
    console.error("Error al crear producto:", error);
    res
      .status(500)
      .json({ error: "Error al crear producto", detalle: error.message });
  }
};

exports.listarProductos = async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      orderBy: { fechaCreacion: "desc" },
    });

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: "Error al listar productos" });
  }
};
