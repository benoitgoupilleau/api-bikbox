const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const SessionPlace = require('./../models/sessionPlace');
const Sensor = require('../models/sensor');
const { authenticate, authenticateAdmin, authenticateEntityManager, authenticateStation } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/sessionPlace', authenticateStation, async (req, res) => {
  try {
    const sessionPlaces = _.pick(req.body, ['sessionPlaces']).sessionPlaces; // faire pour plusieurs capteurs
    if (!sessionPlaces || !Array.isArray(sessionPlaces)) {
      throw 'No sessionPlaces array'
    }
    const sessions = [];
    for (let i = 0; i < sessionPlaces.length; i += 1) {
      const sensor = await Sensor.findOne({ identifier: sessionPlaces[i].identifier, _station: req.station._id })
      if (!sensor) throw 'No sensor found'
      sessions.push(new SessionPlace({
        _sensor: sensor._id, // identifier du capteur
        startDate: sessionPlaces[i].startDate,
        endDate: sessionPlaces[i].endDate,
        createdAt: moment()
      }).save());
    }
    await Promise.all(sessions);
    res.status(200).send(sessions);
  } catch (err) {
    res.status(400).send(err);
  }
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
