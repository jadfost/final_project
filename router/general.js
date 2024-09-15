const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "User already exists" });
  }

  users.push({ username, password });

  console.log(users); // Agregar este log para ver si el usuario se está registrando correctamente.

  return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // En lugar del mensaje, ahora devuelves la lista de libros
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Obtener el ISBN de la solicitud
  const book = books[isbn]; // Buscar el libro por ISBN

  if (book) {
    return res.status(200).json(book); // Si el libro existe, devolver la información
  } else {
    return res.status(404).json({ message: "Book not found" }); // Si no se encuentra, devolver un mensaje de error
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase(); // Convertir el nombre del autor a minúsculas para evitar problemas con mayúsculas
  const booksByAuthor = [];

  // Recorrer los libros para buscar los que coincidan con el autor
  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author) {
      booksByAuthor.push(books[isbn]); // Agregar el libro a la lista si el autor coincide
    }
  }

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor); // Devolver los libros si se encuentran
  } else {
    return res.status(404).json({ message: "No books found for this author" }); // Si no se encuentran libros, devolver un mensaje de error
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase(); // Convertir el título a minúsculas para evitar problemas de mayúsculas
  const booksByTitle = [];

  // Recorrer los libros para buscar los que coincidan con el título
  for (let isbn in books) {
    if (books[isbn].title.toLowerCase() === title) {
      booksByTitle.push(books[isbn]); // Agregar el libro a la lista si el título coincide
    }
  }

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle); // Devolver los libros si se encuentran
  } else {
    return res.status(404).json({ message: "No books found for this title" }); // Si no se encuentran libros, devolver un mensaje de error
  }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn; // Obtener el ISBN de la solicitud
  const book = books[isbn]; // Buscar el libro por ISBN

  if (book && book.reviews) {
    return res.status(200).json(book.reviews); // Devolver las reseñas si existen
  } else {
    return res.status(404).json({ message: "No reviews found for this book" }); // Si no hay reseñas, devolver un mensaje de error
  }
});

// Función que simula una operación asíncrona con un callback
function getBooksAsync(callback) {
  setTimeout(() => {
    callback(null, books); // Llamada al callback con los libros después de un retraso simulado
  }, 1000); // Simulamos que la operación tarda 1 segundo
}

// Ruta para obtener todos los libros usando un callback
public_users.get('/asyncbooks', (req, res) => {
  getBooksAsync((err, result) => {
    if (err) {
      return res.status(500).json({ message: "Error retrieving books" });
    }
    return res.status(200).json(result); // Devolver los libros obtenidos
  });
});

// Función que devuelve una promesa para buscar un libro por ISBN
function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book); // Resuelve la promesa si el libro se encuentra
      } else {
        reject("Book not found"); // Rechaza la promesa si no se encuentra el libro
      }
    }, 1000); // Simulamos una operación asíncrona de 1 segundo
  });
}

// Ruta para buscar un libro por ISBN utilizando promesas
public_users.get('/promise/isbn/:isbn', (req, res) => {
  const isbn = req.params.isbn;

  getBookByISBN(isbn)
    .then((book) => {
      return res.status(200).json(book); // Devuelve el libro si la promesa se resuelve correctamente
    })
    .catch((err) => {
      return res.status(404).json({ message: err }); // Devuelve un error si la promesa es rechazada
    });
});

// Función que devuelve una promesa para buscar libros por autor
function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const booksByAuthor = [];

      // Buscar libros por autor
      for (let isbn in books) {
        if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
          booksByAuthor.push(books[isbn]);
        }
      }

      if (booksByAuthor.length > 0) {
        resolve(booksByAuthor); // Resuelve la promesa si se encuentran libros
      } else {
        reject("No books found for this author"); // Rechaza la promesa si no se encuentra ningún libro
      }
    }, 1000); // Simulamos una operación asíncrona de 1 segundo
  });
}

// Ruta para buscar libros por autor utilizando promesas
public_users.get('/promise/author/:author', (req, res) => {
  const author = req.params.author;

  getBooksByAuthor(author)
    .then((books) => {
      return res.status(200).json(books); // Devuelve los libros si la promesa se resuelve correctamente
    })
    .catch((err) => {
      return res.status(404).json({ message: err }); // Devuelve un error si la promesa es rechazada
    });
});

module.exports.general = public_users;
