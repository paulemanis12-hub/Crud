const mysql = require("mysql2");

const conexion = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",        // Si XAMPP tiene contraseña ponla aquí
  database: "sistema_tareas"   // 👈 NUEVO NOMBRE
});

conexion.connect(function(err) {
  if (err) {
    console.error("❌ Error de conexión:", err);
    return;
  }
  console.log("✅ Conectado a MySQL - Base de datos: sistema_tareas");
});

module.exports = conexion;