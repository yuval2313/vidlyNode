const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const validation = require("../middleware/validation");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");

const { Movie, movieValidation } = require("../models/movie");
const { Genre } = require("../models/genre");

router.post("/", [auth, validation(movieValidation)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) res.status(400).send("Invalid Genre!");

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
    liked: req.body.liked,
  });
  await movie.save();
  res.send(movie);
});

router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("name");
  if (!movies || movies.length <= 0)
    return res.send("There are no movies in the database");
  res.send(movies);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie)
    return res.status(404).send("The Movie with the given ID was not found!");

  res.send(movie);
});

router.put(
  "/:id",
  [auth, validation(movieValidation), admin, validateObjectId],
  async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) res.status(400).send("Invalid Genre!");

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
        liked: req.body.liked,
      },
      { new: true }
    );

    if (!movie)
      return res.status(404).send("The Movie with the given ID was not found!");

    res.send(movie);
  }
);

router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const movie = await Movie.findByIdAndRemove(req.params.id);
  if (!movie)
    return res.status(404).send("The Movie with the given ID was not found!");

  res.send(movie);
});

module.exports = router;
