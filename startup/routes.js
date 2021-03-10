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
    app.use('', homepage);;
    app.use('/api/genres', genres);
    app.use('/api/customers', customers);
    app.use('/api/movies', movies);
    app.use('/api/rentals' , rentals);
    app.use('/api/users' , users);
    app.use('/api/returns' , returns);
    app.use('/api/auth' , auth);
    app.use(error); 
}