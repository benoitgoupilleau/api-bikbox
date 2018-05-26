import express from 'express';
import _ from 'lodash';
import { ObjectID } from 'mongodb';
import moment from 'moment';

import Parking from './../models/parking';
import { authenticate, authenticateAdmin, authenticateEntityManager } from './../middleware/authenticate';
import constants from '../constants';

const route = express.Router();

route.post('/parking', authenticateAdmin, (req, res) => {
  const parking = new Parking({
    name: req.body.name,
    description: req.body.description,
    address: req.body.address,
    _entity: req.body._entity,
    createdAt: moment(req.body.createdAt) && moment()
  })
  parking.save().then((doc) => {
    res.send(doc);
  }, () => {
    res.status(400).send();
  })
});

route.get('/parkings', authenticate, (req, res) => {
  Parking.find({ active: true }).then((parkings) => {
    const filteredParkings = parkings; 
    if (req.user.userType !== constants.userType[2]) {
      filteredParkings.filter((parking) => user._entity.includes(parking._entity))
    }
    res.send(filteredParkings);
  }, () => {
    res.status(400).send();
  })
});

route.get('/parking/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Parking.findOne({
    _id: id,
    active: true
  }).then((parking) => {
    if (!parking) {
      return res.status(404).send();
    }
    res.send({ parking });
  }, () => {
    res.status(400).send();
  })
});

route.delete('/parking/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    const parking = await Parking.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment() } })
    if (!parking) {
      return res.status(404).send();
    }
    res.status(200).send({ parking });
  } catch (e) {
    res.status(400).send();
  }
});

route.patch('/parking/:id', authenticateEntityManager, async (req, res) => {
  try {
    const id = req.params.id;
    const body = _.pick(req.body, ['name', 'description', 'address', '_entity']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    body.lastUpdatedDate = moment()

    const parking = await Parking.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!parking) {
      throw new Error();
    }
    res.send({ parking });
  } catch (e) {
    res.status(400).send();
  }
})

export default route;
