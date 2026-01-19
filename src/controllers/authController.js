const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../models/db");

exports.registro = async (req, res) => {
  console.log(req.body);
  try {
    const {
      nombres,
      experiencia,
      fechaNacimiento,
      lugarNacimiento,
      correo,
      contrasena,
      telefono,
    } = req.body;

    const usuarioExiste = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (usuarioExiste) {
      return res.status(400).json({ error: "El correo ya está registrado" });
    }

    const contrasenaHash = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombres,
        experiencia,
        fechaNacimiento: new Date(fechaNacimiento),
        lugarNacimiento,
        correo,
        contrasena: contrasenaHash,
        telefono,
      },
    });

    const { contrasena: _, ...usuarioSinContrasena } = nuevoUsuario;
    res.status(201).json(usuarioSinContrasena);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al registrar usuario" });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { correo },
    });

    if (!usuario) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const contrasenaValida = await bcrypt.compare(
      contrasena,
      usuario.contrasena
    );

    if (!contrasenaValida) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const { contrasena: _, ...usuarioSinContrasena } = usuario;
    res.json({ token, usuario: usuarioSinContrasena });
  } catch (error) {
    res.status(500).json({ error: "Error al iniciar sesión" });
  }
};
