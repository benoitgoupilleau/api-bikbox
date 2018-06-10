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
    const sessionsToSave = [];
    const failedSessions = []
    for (let i = 0; i < sessionPlaces.length; i += 1) {
      const sensor = await Sensor.findOne({ identifier: sessionPlaces[i].identifier, _station: req.station._id })
      if (sensor) {
        sessionsToSave.push({
          _sensor: sensor._id,
          _entity: req.station._entity,
          startDate: sessionPlaces[i].startDate,
          endDate: sessionPlaces[i].endDate,
          createdAt: moment()
        });
      } else {
        failedSessions.push({
          identifier: sessionPlaces[i].identifier
        })
      }
    }
    const sessions = await SessionPlace.insertMany(sessionsToSave, { ordered: false })
    res.status(200).send({ sessions, failedSessions });
  } catch (err) {
    res.status(400).send(err);
  }
});

route.get('/sessionPlaces', authenticate, async (req, res) => {
  try {
    const sessionPlaces = await SessionPlace.find({ active: true, _entity: { $in: req.user._entity } })
    res.send(sessionPlaces);
  } catch (e) {
    res.status(400).send(e);
  }
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
