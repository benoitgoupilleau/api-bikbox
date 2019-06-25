const mongoose = require('mongoose');
const logger = require('../helpers/logger');

const dbUri = process.env.MONGODB_URI

const maxRetries = 20
let retries = 0

mongoose.connect(dbUri, { useNewUrlParser: true, autoReconnect: true, useCreateIndex: true })

mongoose.connection.on('error', function (error) {
  logger.error('Error in MongoDb connection: ' + JSON.stringify(error.message))
});

mongoose.connection.on('connected', function () {
  logger.info('Connected to MongoDB');
  retries = 0;
});

mongoose.connection.on('disconnected', function () {
  const timeout = 5000
  logger.warn(`MongoDB disconnected! Trying to connect in ${timeout}ms`);
  setTimeout(retryConnection, timeout);
});


const retryConnection = function () {
  if (retries <= maxRetries) {
    mongoose.connect(dbUri, { useNewUrlParser: true, autoReconnect: true, useCreateIndex: true  })
    retries += 1;
  }
}

mongoose.Promise = global.Promise;
module.exports=mongoose;
