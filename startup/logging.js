const { createLogger, transports, format } = require('winston');
require('winston-mongodb');

const logger = createLogger({
    transports: [
        new transports.Console({format: format.simple()}),
        new transports.File({ filename: './logging/logfile.log' })
    ],
    exceptionHandlers: [
        new transports.File({ filename: './logging/exceptions.log' })
    ],
    rejectionHandlers: [
        new transports.File({ filename: './logging/rejections.log' })
    ],
    format: format.combine(
        format.metadata(),
        format.timestamp({ format: () => new Date().toString() }),
        format.json()
    )
});

module.exports = logger;
module.exports.addMongo = function() {
    logger.add(new transports.MongoDB({
        db: 'mongodb://localhost/vidly', 
        level: 'error',
        tryReconnect: true,
        options: {
            useUnifiedTopology: true
        }
        }));
}

