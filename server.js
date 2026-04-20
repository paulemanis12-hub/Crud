const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const conexion = require("./database");

const app = express();

app.use(express.json());
app.use(express.static("."));

// ===== REGISTRO =====
app.post("/register", function(req, res) {

  const email = req.body.email;
  const password = req.body.password;

  bcrypt.hash(password, 10, function(err, hash) {

    const sql = "INSERT INTO usuarios (email, password) VALUES (?, ?)";

    conexion.query(sql, [email, hash], function(err) {

      if (err) {
        console.log(err);
        return res.json({ mensaje: "Error al registrar" });
      }

      res.json({ mensaje: "Usuario creado" });
    });

  });
});

// ===== LOGIN =====
app.post("/login", function(req, res) {

  const email = req.body.email;
  const password = req.body.password;

  const sql = "SELECT * FROM usuarios WHERE email = ?";

  conexion.query(sql, [email], function(err, results) {

    if (results.length === 0) {
      return res.json({ mensaje: "Usuario no existe" });
    }

    const usuario = results[0];

    bcrypt.compare(password, usuario.password, function(err, valid) {

      if (!valid) {
        return res.json({ mensaje: "Contraseña incorrecta" });
      }

      const token = jwt.sign({ id: usuario.id }, "secreto");

      res.json({ token: token });

    });

  });
});

// ===== MIDDLEWARE =====
function verificarToken(req, res, next) {

  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ mensaje: "No autorizado" });
  }

  try {
    const datos = jwt.verify(token, "secreto");
    req.usuario = datos;
    next();
  } catch {
    res.status(401).json({ mensaje: "Token inválido" });
  }
}

// ===== VER TAREAS =====
app.get("/tareas", verificarToken, function(req, res) {

  const sql = "SELECT * FROM tareas WHERE usuario_id = ?";

  conexion.query(sql, [req.usuario.id], function(err, results) {
    res.json(results);
  });
});

// ===== CREAR =====
app.post("/tareas", verificarToken, function(req, res) {

  const sql = "INSERT INTO tareas (texto, completada, usuario_id) VALUES (?, ?, ?)";

  conexion.query(sql, [req.body.texto, false, req.usuario.id], function() {
    res.json({ mensaje: "Tarea creada" });
  });
});

// ===== ELIMINAR =====
app.delete("/tareas/:id", verificarToken, function(req, res) {

  const sql = "DELETE FROM tareas WHERE id = ?";

  conexion.query(sql, [req.params.id], function() {
    res.json({ mensaje: "Eliminada" });
  });
});

// ===== COMPLETAR =====
app.put("/tareas/:id", verificarToken, function(req, res) {

  const sql = "UPDATE tareas SET completada = NOT completada WHERE id = ?";

  conexion.query(sql, [req.params.id], function() {
    res.json({ mensaje: "Actualizada" });
  });
});

// ===== EDITAR =====
app.put("/tareas/editar/:id", verificarToken, function(req, res) {

  const sql = "UPDATE tareas SET texto = ? WHERE id = ?";

  conexion.query(sql, [req.body.texto, req.params.id], function() {
    res.json({ mensaje: "Editada" });
  });
});

// ===== SERVIDOR =====
app.listen(3000, function() {
  console.log("Servidor en http://localhost:3000");
});