const config = require('config');

module.exports = function() {
    if (!config.get('jwtPrivateKey')) {
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined!');
    }
    
    if (!config.get('dbURL')) {
        throw new Error('Please set MongoDB connection string!');
    }
}