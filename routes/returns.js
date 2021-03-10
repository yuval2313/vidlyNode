const Joi = require('joi');
const mongoose = require('mongoose');

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const validation = require('../middleware/validation');

const {Rental} = require('../models/rental'); 
const {Movie} = require('../models/movie'); 

router.post('/', [auth , validation(returnValidation)], async (req, res) => {

    let rental = await Rental.lookUp(req.body.movieId , req.body.customerId);

    if (!rental) return res.status(404).send('No rental found!');

    if(rental.returnDate) return res.status(400).send('Rental has already been returned!')

    rental.returnRental();
    await mongoose.connection.transaction(async (session) => {
        await rental.save({ session });   
        await Movie.updateOne( {_id: rental.movie._id} , { $inc: { numberInStock: 1 } } , { session });
    });
    
    return res.status(200).send(rental);
});

function returnValidation(rental) {
    const schema = {
        movieId: Joi.objectId().required(),
        customerId: Joi.objectId().required(),
    }

    return Joi.validate(rental , schema);
}

module.exports = router;