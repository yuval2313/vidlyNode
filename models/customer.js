const Joi = require('joi');
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    isGold: {
        type: Boolean,
        default: false
    },
    name: {
        type: String,
        required: true,
        match: /^[A-Z].*/,
        minlength: 3,
        maxlength: 50
    },
    phone: {
        type: String, 
        required: true,
        match: /^[0-9]+$/,
        minlength: 3,
        maxlength: 50 
    }
});

const Customer = mongoose.model('Customer' , customerSchema);

function customerValidation(customer) {
    const schema = {
        isGold: Joi.boolean(),
        name: Joi.string().min(3).max(50).regex(/^[A-Z].*/).required(),
        phone: Joi.string().min(3).max(50).regex(/^[0-9]+$/).required()
    };

    return Joi.validate(customer, schema);
};

exports.Customer = Customer;
exports.customerValidation = customerValidation;
exports.customerSchema = customerSchema;