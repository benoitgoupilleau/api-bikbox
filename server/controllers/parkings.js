const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Parking = require('./../models/parking');
const { authenticate, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/parking', authenticateAdmin, (req, res) => {
  const body = _.pick(req.body, ['name', 'description', 'address', '_entity', 'createdAt']);
  const parking = new Parking({
    name: body.name,
    description: body.description,
    address: body.address,
    _entity: body._entity,
    createdAt: moment(body.createdAt) && moment()
  })
  parking.save().then((doc) => {
    res.send(doc);
  }).catch((e) => {
    res.status(400).send(e);
  })
});

route.get('/parkings', authenticate, (req, res) => {
  Parking.find({ active: true }).then((parkings) => {
    let filteredParkings = parkings; 
    if (req.user.userType !== constants.userType[2]) {
      filteredParkings = parkings.filter((parking) => user._entity.includes(parking._entity))
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

module.exports=route;
