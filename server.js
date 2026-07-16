// 1. Import the Express framework
const express = require('express');

const jwt = require('jsonwebtoken');
const session = require('express-session');

// 2. Initialize the application
const app = express();

// 3. Define the port the server will listen on
const PORT = 5000;

// Middleware to parse incoming JSON data (crucial for handling user registration later)
app.use(express.json());
app.use(session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }));

// Middleware to authenticate logged-in users
const authenticateUser = (req, res, next) => {
    // 1. Check if the session has authorization data
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // 2. Verify the JWT token using the secret key 'access'
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // If valid, store the username in the request object so our routes can see WHO is logged in
                req.user = req.session.authorization['username'];
                next(); // Pass control to the next function (the actual route)
            } else {
                return res.status(403).json({ message: "User not authenticated. Invalid Token." });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in." });
    }
};

// --- YOUR ROUTES WILL GO HERE ---

// The PUT endpoint to add or modify a book review (Logged-in users only)
app.put('/books/review/:isbn', authenticateUser, (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review; // Pulls the review text from the query parameters (e.g., ?review=Great book!)
    const username = req.user; // Retrieved automatically from our middleware checkpoint!

    // 1. Check if the user actually typed a review
    if (!reviewText) {
        return res.status(400).json({ message: "Please provide a review message." });
    }

    // 2. Check if the book exists in our database
    if (books[isbn]) {
        // 3. Add or update the review under the user's unique username
        books[isbn].reviews[username] = reviewText;

        return res.status(200).json({
            message: `Review successfully added/modified by ${username}.`,
            updatedReviews: books[isbn].reviews
        });
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

// The DELETE endpoint to delete a book review (Logged-in users only)
app.delete('/books/review/:isbn', authenticateUser, (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user; // Retrieved from our middleware

    // 1. Check if the book exists in our database
    if (books[isbn]) {
        // 2. Check if this specific user actually has a review for this book
        if (books[isbn].reviews[username]) {

            // 3. Delete the review
            delete books[isbn].reviews[username];

            return res.status(200).json({
                message: `Review by ${username} deleted successfully.`,
                updatedReviews: books[isbn].reviews
            });
        } else {
            return res.status(404).json({ message: "You do not have a review for this book to delete." });
        }
    } else {
        return res.status(404).json({ message: "Book not found." });
    }
});

// A temporary mock database of books just to test the route
const books = {
    "123456789": { author: "Chinua Achebe", title: "Things Fall Apart", reviews: { Great: "Absolutely fantastic book, a must-read!" } },
    "987654321": { author: "Hans Christian Andersen", title: "Fairy tales", reviews: { Excelent: "I really enjoyed reading this book, highly recommended!" } }
};



// A temporary mock database to store registered users
let users = [];

// The GET endpoint to retrieve all books
app.get('/books', (req, res) => {
    // res.status(200) indicates a successful HTTP request
    // res.json() sends the data back automatically formatted as JSON
    return res.status(200).json(books);
});

// The GET endpoint to retrieve a specific book by its ISBN
app.get('/books/isbn/:isbn', (req, res) => {
    // 1. Extract the ISBN from the URL parameter
    const requestedIsbn = req.params.isbn;

    // 2. Look up the book in our mock database
    const book = books[requestedIsbn];

    // 3. Conditional logic: Did we find it?
    if (book) {
        // If found, return the book data
        return res.status(200).json(book);
    } else {
        // If not found, return a 404 error with a friendly message
        return res.status(404).json({ message: "Book not found for the provided ISBN." });
    }
});

// The GET endpoint to retrieve books by a specific author
app.get('/books/author/:author', (req, res) => {
    // 1. Extract the author from the URL parameter
    const requestedAuthor = req.params.author;

    // 2. Create an empty array to hold any matches we find
    const matchingBooks = [];

    // 3. Loop through all the keys (ISBNs) in our books object
    for (const isbn in books) {
        // If the author of the current book matches the requested author...
        if (books[isbn].author === requestedAuthor) {
            // ...add it to our array of matches, keeping the ISBN attached for context
            matchingBooks.push({
                isbn: isbn,
                ...books[isbn]
            });
        }
    }

    // 4. Conditional logic: Did we find any books?
    if (matchingBooks.length > 0) {
        // If the array has items, return the array
        return res.status(200).json(matchingBooks);
    } else {
        // If the array is still empty, return a 404
        return res.status(404).json({ message: "No books found by that author." });
    }
});

// The GET endpoint to retrieve books by title
app.get('/books/title/:title', (req, res) => {
    // 1. Extract the title from the URL parameter
    const requestedTitle = req.params.title;

    // 2. Create our empty array for matches
    const matchingBooks = [];

    // 3. Loop through the database
    for (const isbn in books) {
        // Check if the title matches (case-sensitive for now)
        if (books[isbn].title === requestedTitle) {
            matchingBooks.push({
                isbn: isbn,
                ...books[isbn]
            });
        }
    }

    // 4. Return the results or a 404
    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    } else {
        return res.status(404).json({ message: "No books found with that exact title." });
    }
});

// The GET endpoint to retrieve reviews for a specific book by its ISBN
app.get('/books/review/:isbn', (req, res) => {
    // 1. Extract the ISBN from the URL parameter
    const requestedIsbn = req.params.isbn;

    // 2. Look up the book in our mock database
    const book = books[requestedIsbn];

    // 3. Conditional logic: Did we find the book?
    if (book) {
        // If found, return ONLY the reviews property
        return res.status(200).json(book.reviews);
    } else {
        // If the book isn't found, we can't return its reviews
        return res.status(404).json({ message: "Book not found. Cannot fetch reviews." });
    }
});

// The POST endpoint to register a new user
app.post('/register', (req, res) => {
    // 1. Extract the username and password from the request body
    const username = req.body.username;
    const password = req.body.password;

    // 2. Check if both fields were provided
    if (username && password) {
        // 3. Check if the user already exists
        const doesExist = users.filter((user) => user.username === username);

        if (doesExist.length > 0) {
            return res.status(409).json({ message: "User already exists!" });
        } else {
            // 4. If they don't exist, add them to our array
            users.push({ "username": username, "password": password });
            return res.status(201).json({ message: "User successfully registered. Now you can login." });
        }
    }

    // 5. If username or password was missing in the request
    return res.status(400).json({ message: "Unable to register user. Please provide username and password." });
});

// The POST endpoint to log in a user
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // 1. Check if they provided both fields
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in. Please provide username and password." });
    }

    // 2. Check if the user exists and the password matches
    const authenticatedUser = users.filter((user) => {
        return (user.username === username && user.password === password);
    });

    // 3. If a match is found...
    if (authenticatedUser.length > 0) {
        // Generate a JWT token. 'my_secret_key' is the secret password your server uses to sign the token.
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

        // Save the token and username into the session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in!");
    } else {
        // 4. If no match is found
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});



// 4. Start the server
app.listen(PORT, () => {
    console.log(`Server is running beautifully on port ${PORT}`);
});