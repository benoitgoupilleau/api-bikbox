const mongoose = require('mongoose');
const logger = require('../helpers/logger');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI).then(connection => {
    logger.info('Connected to MongoDB')
  }).catch(error => {
    logger.error(error.message, process.env.MONGODB_URI)
  });

module.exports=mongoose;
