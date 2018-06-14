if (process.env.NODE_ENV === 'production') {
  const Raven = require('raven');
  Raven.config(process.env.SENTRY_DSN).install();
}

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const logger = require('./helpers/logger');
const router = require('./controllers/controllers');
require('./db/mongoose.js');

const port = process.env.PORT || 3000;

const morganFormat = ':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

const app = express();
app.use(Raven.requestHandler());
app.use(Raven.errorHandler());
app.use(helmet());
app.use(cors());
app.use(morgan(morganFormat, { stream: logger.stream }))
app.use(bodyParser.json());
app.use(router);

app.listen(port, () => {
  logger.info(`Server running on port ${port}`)
});

module.exports = app;