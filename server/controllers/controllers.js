import express from 'express';

import users from './users';
import entities from './entities';
import parkings from './parkings';
import stations from './stations';
import bikes from './bikes';
import sessionBikes from './sessionBikes';
import sessionPlaces from './sessionPlaces';

const router = express.Router();

router.use(express.static('public'));
router.use(users);
router.use(entities);
router.use(parkings);
router.use(stations);
router.use(bikes);
router.use(sessionBikes);
router.use(sessionPlaces);

router.get('/', async (req, res) => {
  res.status(200).send(`Hello from the API Bik'Box ${JSON.stringify(req.hostname)}`)
});

export default router;
