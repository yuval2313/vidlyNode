const logger = require('../startup/logging');

module.exports = function(err, req, res, next) {
    logger.error('Error Message:', err);
    res.status(500).send('Something Failed!');
}