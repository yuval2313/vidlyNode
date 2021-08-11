const Joi = require("joi");
const mongoose = require("mongoose");

// Date.prototype.addDays = function(days) {
//     let date = new Date(this.valueOf());
//     date.setDate(date.getDate() + days);
//     return date;
// }

// Date.prototype.minusDays = function(days) {
//     let date = new Date(this.valueOf());
//     date.setDate(date.getDate() - days);
//     return date;
// }

const rentalSchema = new mongoose.Schema({
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
      },
    }),
    required: true,
  },
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        match: /^[A-Z].*/,
        minlength: 3,
        maxlength: 50,
      },
      phone: {
        type: String,
        required: true,
        match: /^[0-9]+$/,
        minlength: 3,
        maxlength: 50,
      },
      isGold: {
        type: Boolean,
        default: false,
      },
    }),
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
  },
  returnDate: {
    type: Date,
  },
  price: {
    type: Number,
    get: (v) => Math.round(v),
    set: (v) => Math.round(v),
  },
});

rentalSchema.statics.lookUpActiveRental = function (movieId, customerId) {
  return this.findOne({
    "movie._id": movieId,
    "customer._id": customerId,
    returnDate: null,
  });
};

rentalSchema.methods.returnRental = function () {
  this.returnDate = Date.now();

  let daysPassed = Math.round(
    (this.returnDate - new Date(this.date).getTime()) / 86400000
  );

  if (daysPassed === 0) daysPassed = 1;

  this.price = this.movie.dailyRentalRate * daysPassed;
};

// rentalSchema.methods.goldDiscount = function () {
//   if (this.returnDate && this.price) this.price = this.price * 0.9;
// };

const Rental = mongoose.model("Rental", rentalSchema);

function rentalValidation(rental) {
  const schema = {
    movieId: Joi.objectId().required(),
    customerId: Joi.objectId().required(),
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.rentalValidation = rentalValidation;
