const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const SessionPlace = require('./../models/sessionPlace');
const { authenticate, authenticateAdmin, authenticateEntityManager, authenticateStation } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/sessionPlace', authenticateStation, (req, res) => {
  const body = _.pick(req.body, ['_sensor', 'startDate', 'endDate']); // faire pour plusieurs capteurs
  const sessionPlace = new SessionPlace({
    _sensor: body._sensor, // identifier du capteur
    startDate: body.startDate,
    endDate: body.endDate,
    createdAt: moment()
  })
  sessionPlace.save().then((doc) => {
    res.send(doc);
  }, () => {
    res.status(400).send();
  })
});

route.get('/sessionPlaces', authenticate, (req, res) => {
  SessionPlace.find({}).then((sessionPlaces) => {
    let filteredSessionPlaces = sessionPlaces; 
    // if (req.user.userType === constants.userType[1]) {
    //   filteredSessionPlaces = sessionPlaces.filter((sessionPlace) => user._entity.includes(sessionPlace._id))
    // }
    res.send(filteredSessionPlaces);
  }, () => {
    res.status(400).send();
  })
});

route.get('/sessionPlace/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  SessionPlace.findOne({
    _id: id
  }).then((sessionPlace) => {
    if (!sessionPlace) {
      return res.status(404).send();
    }
    res.send({ sessionPlace });
  }, () => {
    res.status(400).send();
  })
});

route.patch('/sessionPlace/:id', authenticateAdmin, async (req, res) => { // faire ensemble de session
  try {
    const id = req.params.id;
    const body = _.pick(req.body, ['_sensor', 'endDate']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    body.lastUpdatedDate = moment()

    const sessionPlace = await SessionPlace.findOneAndUpdate({ _id: id }, { $set: body }, { new: true })
    if (!sessionPlace) {
      throw new Error();
    }
    res.send({ sessionPlace });
  } catch (e) {
    res.status(400).send();
  }
})

module.exports=route;
