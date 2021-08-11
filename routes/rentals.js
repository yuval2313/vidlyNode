const mongoose = require("mongoose");

const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const validation = require("../middleware/validation");

const { Movie } = require("../models/movie");
const { Customer } = require("../models/customer");
const { Rental, rentalValidation } = require("../models/rental");

router.post("/", [auth, validation(rentalValidation)], async (req, res) => {
  const customer = await Customer.findById(req.body.customerId);
  if (!customer) res.status(400).send("Invalid Customer ID!!");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) res.status(400).send("Invalid Movie ID!!");

  if (movie.numberInStock === 0) res.send("Movie is out of stock!");

  let rental = new Rental({
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
    customer: {
      _id: customer._id,
      name: customer.name,
      isGold: customer.isGold,
      phone: customer.phone,
    },
  });

  await mongoose.connection.transaction(async (session) => {
    await rental.save({ session });
    await Movie.updateOne(
      { _id: movie._id },
      { $inc: { numberInStock: -1 } },
      { session }
    );
  });

  res.send(rental);
});

router.get("/", async (req, res) => {
  const rentals = await Rental.find().sort({ date: 1 });
  if (!rentals || rentals.length <= 0)
    return res.status(404).send("There are no rentals in the database!");

  res.send(rentals);
});

router.get("/:id", async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental) return res.status(400).send("No rental with the given ID");

  res.send(rental);
});

module.exports = router;
