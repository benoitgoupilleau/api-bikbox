require('./config/config.js');

const cluster = require('cluster');
const express= require('express');
var helmet= require('helmet');
const bodyParser = require('body-parser');
const router = require('./controllers/controllers');

var {mongoose} = require('./db/mongoose.js');
const port = process.env.PORT;

if (cluster.isMaster  && process.env.NODE_ENV !== 'test') {
  var cpuCount = require('os').cpus().length;
  for (var i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
} else {
  var app= express();
  app.use(helmet());
  app.use(bodyParser.json());
  app.use(router);

  app.listen(port, ()=>{
    console.log(`Worker ${cluster.worker ? cluster.worker.id : "test"} running on port ${port}`);
  });
}

cluster.on('exit', function (worker) {

    console.log(`'Worker ${worker.id} died`);
    cluster.fork();
});


module.exports={app};
