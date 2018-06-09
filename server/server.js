const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const router = require('./controllers/controllers');
require('./db/mongoose.js');

const port = process.env.PORT || 3000;


const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;