const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');

const {Customer, customerValidation} = require('../models/customer');

router.post('/' , [auth , validation(customerValidation)], async (req, res) => {
    const customer = new Customer({
        isGold: req.body.isGold,
        name: req.body.name,
        phone: req.body.phone
    });
    await customer.save();
    res.send(customer);
});

router.get('/' , async (req, res) => {
    const customers = await Customer.find().sort('name').select({name: 1 , phone: 1 , isGold: 1});
    if(!customers || customers.length <= 0) return res.send('There are no customers in the database');
    res.send(customers);
});

router.get('/:id' , validateObjectId , async (req, res) => {
    const customer = await Customer.findById(req.params.id).select({name: 1 , phone: 1 , isGold: 1});
    if (!customer) return res.status(404).send('The Customer with the given ID was not found!!');

    res.send(customer);
});

router.put('/:id' , [auth , validation(customerValidation) , admin , validateObjectId], async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id , {
        isGold: req.body.isGold,
        name: req.body.name,
        phone: req.body.phone
    } , {new: true}).select({name: 1 , phone: 1 , isGold: 1});

    if (!customer) return res.status(404).send('The Customer with the given ID was not found!');

    res.send('Customer was updated successfully! \n' + customer);
});

router.delete('/:id' , [auth , admin , validateObjectId], async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id).select({name: 1 , phone: 1 , isGold: 1});
    if (!customer) return res.status(404).send('The Customer with the given ID was not found!');

    res.send('Customer was deleted successfully! \n' + customer);
});

module.exports = router;