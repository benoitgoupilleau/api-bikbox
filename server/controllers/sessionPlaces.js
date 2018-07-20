const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const SessionPlace = require('./../models/sessionPlace');
const Sensor = require('../models/sensor');
const { authenticateEntityManager, authenticateAdmin, authenticateStation } = require('./../middleware/authenticate');

const logger = require('../helpers/logger');

const route = express.Router();

route.post('/sessionPlace/station', authenticateStation, async (req, res) => {
  try {
    const sessionPlaces = pick(req.body, ['sessionPlaces']).sessionPlaces;
    if (!sessionPlaces || !Array.isArray(sessionPlaces)) throw new Error('No sessionPlaces array');

    const sessionsToSave = [];
    const failedSessions = []
    const forcedClosedSession = [];
    const sensorUpdated = []
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
          if (sensor.hasSession) {
            const currentSessions = await SessionPlace.find({ identifier: sessionPlaces[i].identifier })
            const session = new SessionPlace({
              identifier: sessionPlaces[i].identifier,
              _parking: req.station._parking,
              _entity: req.station._entity,
              startDate: sessionPlaces[i].startDate,
              endDate: sessionPlaces[i].endDate,
              createdAt: moment().unix()
            });
            for (let i = 0; i< currentSessions.length; i +=1) {
              currentSessions[i].endDate = -999;
              forcedClosedSession.push(currentSessions[i].save());
            }
            sessionsToSave.push(session.save());
          } else {
            sensor.hasSession = true;
            const session = new SessionPlace({
              identifier: sessionPlaces[i].identifier,
              _parking: req.station._parking,
              _entity: req.station._entity,
              startDate: sessionPlaces[i].startDate,
              endDate: sessionPlaces[i].endDate,
              createdAt: moment().unix()
            });
            sensorUpdated.push(sensor.save())
            sessionsToSave.push(session.save());
          }
          
        }
      } else {
        failedSessions.push({
          identifier: sessionPlaces[i].identifier
        })
      }
    }
    await Promise.all(forcedClosedSession);
    await Promise.all(sensorUpdated);
    const sessions = await Promise.all(sessionsToSave)
    res.status(200).send({ sessions: sessions.map((session) => pick(session, ['_id', 'identifier', 'startDate', 'endDate'])), failedSessions });
  } catch (err) {
    logger.error(err)
    res.status(400).send(err);
  }
});

route.get('/sessionPlaces', authenticateEntityManager, async (req, res) => {
  try {
    const sessionPlaces = await SessionPlace.find({ active: true, _entity: { $in: req.user._entity } })
    res.send(sessionPlaces);
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
});

route.get('/sessionPlaces/:id', authenticateEntityManager, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const sessionPlace = await SessionPlace.findOne({ _id: id })
    if (!sessionPlace) throw new Error('No sessionPlace')
    res.send({ sessionPlace });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.delete('/sessionPlaces/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const sessionPlace = await SessionPlace.findOneAndUpdate({ _id: id }, { $set: { active: false, deleteDate: moment().unix() } })
    if (!sessionPlace) throw new Error('No sessionPlace')
    res.send({ sessionPlace });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.patch('/sessionPlaces/:id', authenticateAdmin, async (req, res) => { // faire ensemble de session
  try {
    const id = req.params.id;
    const body = pick(req.body, ['identifier', 'endDate']);

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    body.lastUpdatedDate = moment().unix()

    const sessionPlace = await SessionPlace.findOneAndUpdate({ _id: id, identifier: body.identifier }, { $set: { endDate: body.endDate } }, { new: true })
    if (!sessionPlace) {
      throw new Error();
    }
    res.send({ sessionPlace });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
})

route.patch('/sessionPlace/station', authenticateStation, async (req, res) => {
  try {
    const sessionPlaces = pick(req.body, ['sessionPlaces']).sessionPlaces;
    if (!sessionPlaces || !Array.isArray(sessionPlaces)) throw new Error('No sessionPlaces array');

    const sessions = []
    const failedSessions = []
    for (let i = 0; i < sessionPlaces.length; i += 1) {
      const sessionPlace = await SessionPlace.findOneAndUpdate({ _id: sessionPlaces[i]._id, identifier: sessionPlaces[i].identifier }, { $set: { endDate: sessionPlaces[i].endDate } }, { new: true })
      if (!sessionPlace) {
        failedSessions.push(sessionPlaces[i])
      }
      sessions.push(pick(sessionPlace, ['_id', 'identifier', 'startDate', 'endDate']));
    }
    res.status(200).send({ sessions, failedSessions });
  } catch (err) {
    logger.error(err);
    res.status(400).send(err);
  }
});

module.exports=route;
