INSTRUCCIONES

1. Instalar Node.js
2. Instalar XAMPP
3. Iniciar Apache y MySQL en XAMPP
4. Ir a http://localhost/phpmyadmin
5. Crear base de datos: crud_db

6. Ejecutar estas tablas:

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100),
  password VARCHAR(255)
);

CREATE TABLE tareas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  texto VARCHAR(255),
  completada BOOLEAN,
  usuario_id INT
);

7. En la carpeta del proyecto ejecutar:
   npm install

8. Ejecutar el servidor:
   node server.js

9. Abrir en el navegador:
   http://localhost:3000