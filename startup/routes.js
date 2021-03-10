const express = require('express');
require('express-async-errors');

const genres = require('../routes/genres');
const customers = require('../routes/customers');
const rentals = require('../routes/rentals');
const movies = require('../routes/movies');
const homepage = require('../routes/homepage');
const users = require('../routes/users');
const returns = require('../routes/returns');
const auth = require('../routes/auth');
const error = require('../middleware/error');

module.exports = function(app) {
    app.use(express.json());
    app.use('/vidly', homepage);;
    app.use('/vidly/api/genres', genres);
    app.use('/vidly/api/customers', customers);
    app.use('/vidly/api/movies', movies);
    app.use('/vidly/api/rentals' , rentals);
    app.use('/vidly/api/users' , users);
    app.use('/vidly/api/returns' , returns);
    app.use('/vidly/api/auth' , auth);
    app.use(error); 
}