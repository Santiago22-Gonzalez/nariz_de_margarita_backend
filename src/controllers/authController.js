const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../models/db");

exports.registro = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      fechaNacimiento,
      lugarNacimiento,
      correo,
      contraseña,
    } = req.body;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (usuarioExiste) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const contraseñaHash = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombres,
        apellidos,
        fechaNacimiento: new Date(fechaNacimiento),
        lugarNacimiento,
        correo,
        contraseña: contraseñaHash,
      },
    });

    const { contraseña: _, ...usuarioSinContraseña } = nuevoUsuario;
    res.status(201).json(usuarioSinContraseña);
  } catch (error) {
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const contraseñaValida = await bcrypt.compare(
      contraseña,
      usuario.contraseña
    );

    if (!contraseñaValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { contraseña: _, ...usuarioSinContraseña } = usuario;
    res.json({ token, usuario: usuarioSinContraseña });
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};
