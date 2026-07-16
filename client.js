// Import the Axios library
const axios = require('axios');

// The base URL of the Express server you built
const baseURL = 'http://localhost:5000';

// ==========================================
// Task 1: Get all books using Async/Await
// ==========================================
async function getAllBooks() {
    try {
        // "await" pauses the function until the server responds
        const response = await axios.get(`${baseURL}/books`);
        console.log("\n--- 1. ALL BOOKS ---");
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching all books:", error.message);
    }
}

// ==========================================
// Task 2: Get book by ISBN using a Promise
// ==========================================
function getBookByISBN(isbn) {
    // Promises use .then() for success and .catch() for errors
    axios.get(`${baseURL}/books/isbn/${isbn}`)
        .then(response => {
            console.log(`\n--- 2. BOOK WITH ISBN: ${isbn} ---`);
            console.log(response.data);
        })
        .catch(error => {
            console.error("Error fetching by ISBN:", error.message);
        });
}

// ==========================================
// Task 3: Get books by Author using Async/Await
// ==========================================
async function getBooksByAuthor(author) {
    try {
        const response = await axios.get(`${baseURL}/books/author/${author}`);
        console.log(`\n--- 3. BOOKS BY: ${author} ---`);
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching by author:", error.message);
    }
}

// ==========================================
// Task 4: Get books by Title using a Promise
// ==========================================
function getBooksByTitle(title) {
    axios.get(`${baseURL}/books/title/${title}`)
        .then(response => {
            console.log(`\n--- 4. BOOKS WITH TITLE: ${title} ---`);
            console.log(response.data);
        })
        .catch(error => {
            console.error("Error fetching by title:", error.message);
        });
}

// ==========================================
// Execute the functions to test them
// ==========================================
// We wrap them in a master execution function just to keep the terminal output clean
async function runAllTests() {
    console.log("Starting Client Requests...");

    await getAllBooks();

    // We use setTimeout here just to format the console logs nicely so they don't overlap 
    // since Promises run simultaneously in the background!
    setTimeout(() => getBookByISBN("123456789"), 500);
    setTimeout(() => getBooksByAuthor("Hans%20Christian%20Andersen"), 1000);
    setTimeout(() => getBooksByTitle("Things%20Fall%20Apart"), 1500);
}

runAllTests();