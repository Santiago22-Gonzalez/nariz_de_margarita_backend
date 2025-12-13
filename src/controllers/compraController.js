const prisma = require("../models/db");

exports.crearCompra = async (req, res) => {
  try {
    const { usuarioId, productos } = req.body;

    const compras = [];

    for (const item of productos) {
      const producto = await prisma.producto.findUnique({
        where: { id: item.productoId },
      });

      if (!producto) {
        return res
          .status(404)
          .json({ error: `Producto ${item.productoId} no encontrado` });
      }

      if (producto.cantidad < item.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.cantidad}`,
        });
      }

      const precioConDescuento =
        producto.precio - (producto.precio * producto.descuento) / 100;
      const precioTotal = precioConDescuento * item.cantidad;

      const compra = await prisma.usuarioCompra.create({
        data: {
          usuarioId,
          productoId: item.productoId,
          cantidad: item.cantidad,
          precioTotal,
        },
      });

      await prisma.producto.update({
        where: { id: item.productoId },
        data: { cantidad: producto.cantidad - item.cantidad },
      });

      compras.push(compra);
    }

    res.status(201).json({
      mensaje: "Compra realizada exitosamente",
      compras,
    });
  } catch (error) {
    res.status(500).json({ error: "Error al procesar la compra" });
  }
};
