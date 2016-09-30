var _ = require('underscore');

var books = require('./applicationData').books;

var todos = require('./applicationData').todos;

function getBooks() {
    return _.filter(books, function(book) {
        return book.archived === false;
    });
}

module.exports = {
    getBooks: getBooks
};