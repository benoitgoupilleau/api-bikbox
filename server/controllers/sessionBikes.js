const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const SessionBike = require('./../models/sessionBike');
const Bike = require('../models/bike');
const { authenticate, authenticateAdmin, authenticateStation } = require('./../middleware/authenticate');

const logger = require('../helpers/logger');

const route = express.Router();

route.post('/sessionBike/station', authenticateStation, async (req, res) => {
  try {
    const sessionBikes = pick(req.body, ['sessionBikes']).sessionBikes;
    if (!sessionBikes || !Array.isArray(sessionBikes)) {
      throw 'No sessionBikes array'
    }
    const sessionsToSave = [];
    const failedSessions = []
    for (let i = 0; i < sessionBikes.length; i += 1) {
      const bike = await Bike.findOne({ identifier: sessionBikes[i].identifier, _entity: req.station._entity })
      if (bike) {
        const sessionBike = await SessionBike.findOne({ identifier: sessionBikes[i].identifier, startDate: sessionBikes[i].startDate })
        if (sessionBike) {
          failedSessions.push({
            identifier: sessionBikes[i].identifier,
            startDate: sessionBikes[i].startDate,
          })
        } else {
          const session = new SessionBike({
            identifier: sessionBikes[i].identifier,
            _parking: req.station._parking,
            _entity: req.station._entity,
            startDate: sessionBikes[i].startDate,
            endDate: sessionBikes[i].endDate,
            createdAt: moment()
          });
          sessionsToSave.push(session.save());
        }
      } else {
        failedSessions.push({
          identifier: sessionBikes[i].identifier
        })
      }
    }
    const sessions = await Promise.all(sessionsToSave)
    res.status(200).send({ sessions: sessions.map((session) => pick(session, ['_id', 'identifier', 'startDate', 'endDate'])), failedSessions });
  } catch (err) {
    logger.error(err);
    res.status(400).send(err);
  }
});

route.get('/sessionBikes', authenticate, async (req, res) => {
  try {
    const sessionBikes = await SessionBike.find({ active: true, _entity: { $in: req.user._entity } })
    res.send(sessionBikes);
  } catch (err) {
    logger.error(err);
    res.status(400).send();
  }
});

route.get('/sessionBike/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const sessionBike = await SessionBike.findOne({ _id: id });
    if (!sessionBike) throw new Error('No sessionBike');
    
    res.send({ sessionBike });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.patch('/sessionBike/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = pick(req.body, ['identifier', 'endDate']);

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    body.lastUpdatedDate = moment()

    const sessionBike = await SessionBike.findOneAndUpdate({ _id: id, identifier: body.identifier }, { $set: { endDate: body.endDate } }, { new: true })
    if (!sessionBike) {
      throw new Error();
    }
    res.send({ sessionBike });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
})

route.patch('/sessionBike/station', authenticateStation, async (req, res) => {
  try {
    const sessionBikes = pick(req.body, ['sessionBikes']).sessionBikes;
    if (!sessionBikes || !Array.isArray(sessionBikes)) {
      throw 'No sessionBikes array'
    }
    const sessions = []
    const failedSessions = []
    for (let i = 0; i < sessionBikes.length; i += 1) {
      const sessionBike = await SessionBike.findOneAndUpdate({ _id: sessionBikes[i]._id, identifier: sessionBikes[i].identifier }, { $set: { endDate: sessionBikes[i].endDate } }, { new: true })
      if (!sessionBike) {
        failedSessions.push(sessionBikes[i])
      }
      sessions.push(pick(sessionBike, ['_id', 'identifier', 'startDate', 'endDate']));
    }
    res.status(200).send({ sessions, failedSessions });
  } catch (err) {
    logger.error(err);
    res.status(400).send(err);
  }
});

module.exports=route;
