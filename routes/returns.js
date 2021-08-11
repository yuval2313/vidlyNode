const Joi = require("joi");
const mongoose = require("mongoose");

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const validation = require("../middleware/validation");
const validateObjectId = require("../middleware/validateObjectId");

const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
// const { Customer } = require("../models/customer");

router.post("/", [auth, validation(returnValidation)], async (req, res) => {
  let rental = await Rental.lookUpActiveRental(
    req.body.movieId,
    req.body.customerId
  );
  //   let customer = await Customer.findById(req.body.customerId);

  if (!rental) return res.status(404).send("No rental found!");

  rental.returnRental();

  //   if (customer && customer.isGold) rental.goldDiscount();

  await mongoose.connection.transaction(async (session) => {
    await rental.save({ session });
    await Movie.updateOne(
      { _id: rental.movie._id },
      { $inc: { numberInStock: 1 } },
      { session }
    );
  });

  return res.send(rental);
});

router.post("/:id", [auth, validateObjectId], async (req, res) => {
  let rental = await Rental.findById(req.params.id);
  //   let customer = await Customer.findById(req.body.customerId);

  if (!rental)
    return res.status(404).send("Rental with the given ID was not found");

  if (rental.returnDate)
    return res.status(400).send("Rental has already been returned!");

  rental.returnRental();

  //   if (customer && customer.isGold) rental.goldDiscount();

  await mongoose.connection.transaction(async (session) => {
    await rental.save({ session });
    await Movie.updateOne(
      { _id: rental.movie._id },
      { $inc: { numberInStock: 1 } },
      { session }
    );
  });

  return res.send(rental);
});

function returnValidation(rental) {
  const schema = {
    movieId: Joi.objectId().required(),
    customerId: Joi.objectId().required(),
  };

  return Joi.validate(rental, schema);
}

module.exports = router;
