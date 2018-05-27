import express from 'express';

import users from './users';
import entities from './entities';
import parkings from './parkings';
import stations from './stations';

import { transporter, resetEmail, passwordchangedEmail } from './../email/mailconfig';

const router = express.Router();

router.use(express.static('public'));
router.use(users);
router.use(entities);
router.use(parkings);
router.use(stations);

router.get('/', async (req, res) => {
  res.status(200).send(`Hello from the API BikBox ${JSON.stringify(req.hostname)}`)
});

// router.get('/test', async (req, res) => {
  // transporter.sendMail(resetEmail({ email: 'benoit.goupilleau@gmail.com', firstname: 'Test' }, 'testurl'), (err, info) => {
  //   if (err) {
  //     console.log(err);
  //     return res.status(502).send()
  //   }
  //   return res.status(200).send()
  // })
// })


export default router;
