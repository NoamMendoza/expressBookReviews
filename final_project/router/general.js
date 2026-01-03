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

public_users.get('/', async function (req, res) {
    try {
        const getBooks = new Promise((resolve) => {
            resolve(books);
        });
        const bookList = await getBooks;
        res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error retrieving books" });
    }
});

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    const getBook = new Promise((resolve, reject) => {
        if (books[isbn]) {
            resolve(books[isbn]);
        } else {
            reject({ status: 404, message: "Book not found" });
        }
    });

    getBook
        .then((book) => res.status(200).send(JSON.stringify(book, null, 4)))
        .catch((err) => res.status(err.status).json({ message: err.message }));
});

public_users.get('/author/:author', async function (req, res) {
    const authorParam = req.params.author;

    try {
        const getByAuthor = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            const filtered = keys
                .filter(key => books[key].author.toLowerCase() === authorParam.toLowerCase())
                .map(key => ({ isbn: key, ...books[key] }));

            if (filtered.length > 0) {
                resolve(filtered);
            } else {
                reject({ status: 404, message: "No books found for this author" });
            }
        });

        const result = await getByAuthor;
        res.status(200).send(JSON.stringify(result, null, 4));
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

public_users.get('/title/:title', async function (req, res) {
    const titleParam = req.params.title;

    try {
        const getByTitle = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            const filtered = keys
                .filter(key => books[key].title.toLowerCase().includes(titleParam.toLowerCase()))
                .map(key => ({ isbn: key, ...books[key] }));

            if (filtered.length > 0) {
                resolve(filtered);
            } else {
                reject({ status: 404, message: "No books found with this title" });
            }
        });

        const result = await getByTitle;
        res.status(200).send(JSON.stringify(result, null, 4));
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
});

public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        res.status(200).send(JSON.stringify(book.reviews, null, 4));
    } else {
        res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;