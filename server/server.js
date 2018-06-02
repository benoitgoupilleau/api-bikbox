import cluster from 'cluster';
import os from 'os';
import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import router from './controllers/controllers';
import mongoose from './db/mongoose.js';

const port = process.env.PORT || 3000;

if (cluster.isMaster  && process.env.NODE_ENV !== 'test') {
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
} else {
  const app = express();
  app.use(helmet());
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
