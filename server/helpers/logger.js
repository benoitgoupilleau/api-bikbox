const { createLogger, format, transports } = require('winston');
require('winston-mongodb');

const { combine, timestamp, label, printf } = format;


const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});


const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'API' }),
    timestamp(),
    myFormat
  ),
  transports: [
    new transports.Console({ colorize: true }),
    new transports.File({ filename: 'logs/error.log', level: 'error', colorize: true, json: true }),
    new transports.File({ filename: 'logs/combined.log', colorize: true, json: true }),
    new transports.MongoDB({ name: 'errorLogs', db: process.env.MONGOLAB_SILVER_URI, level: 'error', collection: 'errorLog'}),
    new transports.MongoDB({ name: 'combinedLogs', db: process.env.MONGOLAB_SILVER_URI, collection: 'combinedLog' })
  ],
  exitOnError: false,
});


logger.stream = {
  write: function (message, encoding) {
    logger.info(message.substring(0, message.lastIndexOf('\n')));
  },
};

module.exports = logger;
