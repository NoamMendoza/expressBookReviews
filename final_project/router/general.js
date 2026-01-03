const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const userExists = users.some((user) => user.username === username);

    if (userExists) {
        return res.status(409).json({ message: "Username already exists" });
    }

    users.push({
        "username": username,
        "password": password
    });

    return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify({books},null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.send(JSON.stringify({book},null,4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }

 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorParam = req.params.author; 
    const keys = Object.keys(books);
    let booksByAuthor = [];

    keys.forEach(key => {
        if (books[key].author.toLowerCase().includes(authorParam.toLowerCase())) {
            booksByAuthor.push({
                isbn: key,
                ...books[key]
            });
        }
    });

    if (booksByAuthor.length > 0) {
        return res.send(JSON.stringify({booksByAuthor},null,4));
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleParam = req.params.title; 
    const keys = Object.keys(books);
    let booksByTitle = [];

    keys.forEach(key => {
        if (books[key].title.toLowerCase().includes(titleParam.toLowerCase())) {
            booksByTitle.push({
                isbn: key,
                ...books[key]
            });
        }
    });

    if (booksByTitle.length > 0) {
        return res.send(JSON.stringify({booksByTitle},null,4));
    } else {
        return res.status(404).json({ message: "No books found with this" });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn];

    if (book) {
        return res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
