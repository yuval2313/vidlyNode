const Joi = require("joi");
const mongoose = require("mongoose");
const { genreSchema } = require("./genre");

const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
  },
  genre: {
    type: genreSchema,
    required: true,
  },
  numberInStock: {
    type: Number,
    required: true,
  },
  dailyRentalRate: {
    type: Number,
    required: true,
  },
  liked: {
    type: Boolean,
    required: false,
  },
});

const Movie = mongoose.model("Movie", movieSchema);

function movieValidation(movie) {
  const schema = {
    title: Joi.string().required().min(3).max(50),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().required(),
    dailyRentalRate: Joi.number().required(),
    liked: Joi.boolean(),
  };

  return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.movieValidation = movieValidation;
exports.movieSchema = movieSchema;
