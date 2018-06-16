const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const SessionPlace = require('./../models/sessionPlace');
const Sensor = require('../models/sensor');
const { authenticate, authenticateAdmin, authenticateStation } = require('./../middleware/authenticate');

const route = express.Router();

route.post('/sessionPlace/station', authenticateStation, async (req, res) => {
  try {
    const sessionPlaces = pick(req.body, ['sessionPlaces']).sessionPlaces; // faire pour plusieurs capteurs
    if (!sessionPlaces || !Array.isArray(sessionPlaces)) {
      throw 'No sessionPlaces array'
    }
    const sessionsToSave = [];
    const failedSessions = []
    for (let i = 0; i < sessionPlaces.length; i += 1) {
      const sensor = await Sensor.findOne({ identifier: sessionPlaces[i].identifier, _station: req.station._id })
      if (sensor) {
        const sessionPlace = await SessionPlace.findOne({ identifier: sessionPlaces[i].identifier, startDate: sessionPlaces[i].startDate})
        if (sessionPlace) {
          failedSessions.push({
            identifier: sessionPlaces[i].identifier,
            startDate: sessionPlaces[i].startDate,
          })
        } else {
          const session = new SessionPlace({
            identifier: sessionPlaces[i].identifier,
            _entity: req.station._entity,
            startDate: sessionPlaces[i].startDate,
            endDate: sessionPlaces[i].endDate,
            createdAt: moment()
          });
          sessionsToSave.push(session.save());
        }
      } else {
        failedSessions.push({
          identifier: sessionPlaces[i].identifier
        })
      }
    }
    const sessions = await Promise.all(sessionsToSave)
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

route.get('/sessionPlaces/:id', authenticate, (req, res) => {
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

route.patch('/sessionPlaces/:id', authenticateAdmin, async (req, res) => { // faire ensemble de session
  try {
    const id = req.params.id;
    const body = pick(req.body, ['identifier', 'endDate']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    body.lastUpdatedDate = moment()

    const sessionPlace = await SessionPlace.findOneAndUpdate({ _id: id, identifier: body.identifier }, { $set: { endDate: body.endDate } }, { new: true })
    if (!sessionPlace) {
      throw new Error();
    }
    res.send({ sessionPlace });
  } catch (e) {
    res.status(400).send();
  }
})

route.patch('/sessionPlace/station', authenticateStation, async (req, res) => {
  try {
    const sessionPlaces = pick(req.body, ['sessionPlaces']).sessionPlaces;
    if (!sessionPlaces || !Array.isArray(sessionPlaces)) {
      throw 'No sessionPlaces array'
    }
    const sessions = []
    const failedSessions = []
    for (let i = 0; i < sessionPlaces.length; i += 1) {
      const sessionPlace = await SessionPlace.findOneAndUpdate({ _id: sessionPlaces[i]._id, identifier: sessionPlaces[i].identifier }, { $set: { endDate: sessionPlaces[i].endDate } }, { new: true })
      if (!sessionPlace) {
        failedSessions.push(sessionPlaces[i])
      }
      sessions.push(sessionPlace);
    }
    res.status(200).send({ sessions, failedSessions });
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports=route;
