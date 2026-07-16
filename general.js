const axios = require('axios');
const baseURL = 'http://localhost:5000';


async function getAllBooks() {
    try {
        const response = await axios.get(`${baseURL}/books`);
        console.log("--- ALL BOOKS ---");
        console.log(response.data);
    } catch (error) {
        console.error("Error fetching books:", error.message);
    }
}


function getBookByISBN(isbn) {
    axios.get(`${baseURL}/books/isbn/${isbn}`)
        .then(response => {
            console.log(`\n--- BOOK ISBN: ${isbn} ---`);
            console.log(response.data);
        })
        .catch(error => console.error(error.message));
}


async function getBooksByAuthor(author) {
    try {
        const response = await axios.get(`${baseURL}/books/author/${author}`);
        console.log(`\n--- BOOKS BY: ${author} ---`);
        console.log(response.data);
    } catch (error) {
        console.error(error.message);
    }
}


function getBooksByTitle(title) {
    axios.get(`${baseURL}/books/title/${title}`)
        .then(response => {
            console.log(`\n--- BOOKS TITLE: ${title} ---`);
            console.log(response.data);
        })
        .catch(error => console.error(error.message));
}

// Execute the functions
getAllBooks();
setTimeout(() => getBookByISBN("123456789"), 500);
setTimeout(() => getBooksByAuthor("Chinua%20Achebe"), 1000);
setTimeout(() => getBooksByTitle("Fairy%20tales"), 1500);