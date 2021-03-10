const Joi = require('joi');
const bcrypt = require('bcrypt');

const express = require('express');
const router = express.Router();

const validation = require('../middleware/validation');

const {User} = require('../models/user');

router.post('/' , validation(validateAuth) , async (req , res) => {
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.status(404).send('Invalid Email or Password!');

    const valid = await bcrypt.compare(req.body.password , user.password);
    if (!valid) return res.status(404).send('Invalid Email or Password!');
    
    const token = user.generateAuthToken();
    res.send(token);
});

function validateAuth(user) {
    const schema = {
        email: Joi.string().min(5).max(255).email().required(),
        password: Joi.string().min(5).max(255).required()
    }
    return Joi.validate(user , schema);
}

module.exports = router;