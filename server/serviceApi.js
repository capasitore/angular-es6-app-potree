var _ = require('underscore');

var books = require('./applicationData').books;

var todos = require('./applicationData').missions;

function getBooks() {
    return _.filter(books, function(book) {
        return book.archived === false;
    });
}

function getMissionList() {
    return todos;
}


module.exports = {
    getBooks: getBooks,
    getMissionList: getMissionList
};