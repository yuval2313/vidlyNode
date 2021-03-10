const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const admin = require('../middleware/admin');
const validateObjectId = require('../middleware/validateObjectId');

const {Genre , genreValidation} = require('../models/genre');

router.post('/', [auth , validation(genreValidation)], async (req, res) => {
    let genre = new Genre({ name: req.body.name });
    genre = await genre.save();

    res.send(genre);   
});

router.get('/', async (req, res) => {
    const genres = await Genre.find().sort({name: 1}).select({name: 1});
    res.send(genres);
});

router.get('/:id', validateObjectId , async (req, res) => {
    const genre = await Genre.findById(req.params.id).select({name: 1});
    if (!genre) return res.status(404).send('The genre with the given id was not found');

    res.send(genre);
});

router.put('/:id', [auth , validation(genreValidation) , admin , validateObjectId], async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(req.params.id , {name: req.body.name} , {new: true}).select({name: 1});
    if (!genre) return res.status(404).send('The genre with the given id was not found!');

    res.send(genre);
});

router.delete('/:id', [auth , admin, validateObjectId], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id).select({name: 1});
    if (!genre) return res.status(404).send('The genre with the given id was not found');

    res.send(genre);
});

module.exports = router;