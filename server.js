const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const conexion = require("./database");
const path = require("path");

const app = express();

app.use(express.json());
app.use(express.static(__dirname));  // Sirve index.html, styles.css

// ========== MIDDLEWARE PARA RUTAS PROTEGIDAS ==========
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

// ========== RUTAS DE AUTENTICACIÓN ==========
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensaje: "Completa todos los campos" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO usuarios (email, password) VALUES (?, ?)";

    conexion.query(sql, [email, hash], (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ mensaje: "Email ya registrado" });
        }
        return res.status(500).json({ mensaje: "Error al registrar" });
      }
      res.json({ mensaje: "Usuario creado correctamente" });
    });
  } catch {
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM usuarios WHERE email = ?";
  conexion.query(sql, [email], (err, results) => {
    if (results.length === 0) {
      return res.status(401).json({ mensaje: "Usuario no existe" });
    }

    const usuario = results[0];
    bcrypt.compare(password, usuario.password, (err, valid) => {
      if (!valid) {
        return res.status(401).json({ mensaje: "Contraseña incorrecta" });
      }

      const token = jwt.sign({ id: usuario.id, email: usuario.email }, "secreto", { expiresIn: "24h" });
      res.json({ token, usuario: { id: usuario.id, email: usuario.email } });
    });
  });
});

// ========== RUTAS PROTEGIDAS DE TAREAS ==========
app.get("/api/tareas", verificarToken, (req, res) => {
  const sql = "SELECT * FROM tareas WHERE usuario_id = ? ORDER BY id DESC";
  conexion.query(sql, [req.usuario.id], (err, results) => {
    res.json(results);
  });
});

app.post("/api/tareas", verificarToken, (req, res) => {
  const { texto } = req.body;
  const sql = "INSERT INTO tareas (texto, completada, usuario_id) VALUES (?, ?, ?)";
  conexion.query(sql, [texto, false, req.usuario.id], (err) => {
    if (err) {
      return res.status(500).json({ mensaje: "Error al crear tarea" });
    }
    res.json({ mensaje: "Tarea creada" });
  });
});

app.delete("/api/tareas/:id", verificarToken, (req, res) => {
  const sql = "DELETE FROM tareas WHERE id = ? AND usuario_id = ?";
  conexion.query(sql, [req.params.id, req.usuario.id], (err) => {
    res.json({ mensaje: "Eliminada" });
  });
});

app.put("/api/tareas/:id", verificarToken, (req, res) => {
  const sql = "UPDATE tareas SET completada = NOT completada WHERE id = ? AND usuario_id = ?";
  conexion.query(sql, [req.params.id, req.usuario.id], (err) => {
    res.json({ mensaje: "Actualizada" });
  });
});

app.put("/api/tareas/editar/:id", verificarToken, (req, res) => {
  const { texto } = req.body;
  const sql = "UPDATE tareas SET texto = ? WHERE id = ? AND usuario_id = ?";
  conexion.query(sql, [texto, req.params.id, req.usuario.id], (err) => {
    res.json({ mensaje: "Editada" });
  });
});

// ========== INICIAR SERVIDOR ==========
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`✅ Frontend + API unificados (sin CORS)`);
  console.log(`🔒 Rutas protegidas: /api/tareas/*\n`);
});