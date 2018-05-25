import express from 'express';

import users from './users';

const router = express.Router();

router.use(express.static('public'));
router.use(users);

router.get('/', async (req, res) => {
  res.status(200).send(`Hello from the API BikBox ${JSON.stringify(req.hostname)}`)
});


export default router;
