const express = require('express');
const jwt = require('jsonwebtoken');
const secretKey = 'your-secret-key'; // Define tu clave secreta aquí
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Lógica para verificar si el usuario ya existe
  return users.some(user => user.username === username);
};

const authenticatedUser = (username, password) => {
  // Lógica para autenticar usuario (puedes mejorar esta función)
  return users.some(user => user.username === username && user.password === password);
};

module.exports.users = users;
module.exports.isValid = isValid;
module.exports.authenticatedUser = authenticatedUser;

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    // Generar el token JWT
    const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
    return res.status(200).json({ message: "Customer Successfully Logged In", token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username; // Obtener el nombre de usuario del token JWT

  // Verificar si el libro existe
  if (books[isbn]) {
    const reviews = books[isbn].reviews;

    // Verificar si el usuario ha publicado una reseña para este libro
    if (reviews && reviews[username]) {
      delete reviews[username]; // Eliminar la reseña del usuario
      return res.status(200).json({ message: `Review for ISBN ${isbn} posted by the user ${username} deleted.` });
    } else {
      return res.status(404).json({ message: `No review found for ISBN ${isbn} posted by the user ${username}.` });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
