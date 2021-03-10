const mongoose = require('mongoose');
const logger = require('./logging');
const config = require('config');

module.exports = function() {
    const dbURL = config.get('dbURL')
    mongoose.connect( dbURL , { useUnifiedTopology: true , useNewUrlParser: true , useCreateIndex: true , useFindAndModify: false})
    .then(() => { 
        logger.info(`Connected to ${dbURL} Successfully!`);
        // logger.addMongo(); //CAUSES ISSUES WHEN TESTING
    })
} 