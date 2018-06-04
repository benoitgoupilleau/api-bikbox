const express = require('express');

const users = require('./users');
const entities = require('./entities');
const parkings = require('./parkings');
const stations = require('./stations');
const bikes = require('./bikes');
const sessionBikes = require('./sessionBikes');
const sessionPlaces = require('./sessionPlaces');
const sensors = require('./sensors');

const router = express.Router();

router.use(express.static('public'));
router.use(users);
router.use(entities);
router.use(parkings);
router.use(stations);
router.use(bikes);
router.use(sessionBikes);
router.use(sessionPlaces);
router.use(sensors);

router.get('/', async (req, res) => {
  res.status(200).send(`Hello from the API Bik'Box`)
});

module.exports=router;
