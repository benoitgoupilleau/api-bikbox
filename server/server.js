const cluster = require('cluster');
const os = require('os');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./controllers/controllers');
const mongoose = require('./db/mongoose.js');

const port = process.env.PORT || 3000;


if (cluster.isMaster  && process.env.NODE_ENV !== 'test' && process.env.ALLOW_CLUSTER) {
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
} else {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(bodyParser.json());
  app.use(router);

  app.listen(port, () => {
    console.log(`Worker ${cluster.worker ? cluster.worker.id : "test"} running on port ${port}`);
  });
  module.exports = app;
}

cluster.on('exit', (worker) => {
  console.log(`'Worker ${worker.id} died`);
  cluster.fork();
});
