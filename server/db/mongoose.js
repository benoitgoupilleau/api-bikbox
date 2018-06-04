const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI).then(connection => {
    console.log('Connected to MongoDB')
  }).catch(error => {
    console.log(error.message, process.env.MONGODB_URI)
  });

module.exports=mongoose;
