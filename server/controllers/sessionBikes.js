const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const SessionBike = require('./../models/sessionBike');
const { authenticate, authenticateAdmin, authenticateEntityManager, authenticateStation } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/sessionBike', authenticateStation, (req, res) => {
  const body = _.pick(req.body, ['_bike', 'startDate', 'endDate']);
  const sessionBike = new SessionBike({
    _bike: body._bike,
    startDate: body.startDate,
    endDate: body.endDate,
    createdAt: moment()
  })
  sessionBike.save().then((doc) => {
    res.send(doc);
  }, () => {
    res.status(400).send();
  })
});

route.get('/sessionBikes', authenticate, (req, res) => {
  SessionBike.find({}).then((sessionBikes) => {
    let filteredSessionBikes = sessionBikes; 
    // if (req.user.userType === constants.userType[1]) {
    //   filteredSessionBikes = sessionBikes.filter((sessionBike) => user._entity.includes(sessionBike._id))
    // }
    res.send(filteredSessionBikes);
  }, () => {
    res.status(400).send();
  })
});

route.get('/sessionBike/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  SessionBike.findOne({
    _id: id
  }).then((sessionBike) => {
    if (!sessionBike) {
      return res.status(404).send();
    }
    res.send({ sessionBike });
  }, () => {
    res.status(400).send();
  })
});

route.patch('/sessionBike/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = _.pick(req.body, ['_bike', 'endDate']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    body.lastUpdatedDate = moment()

    const sessionBike = await SessionBike.findOneAndUpdate({ _id: id }, { $set: body }, { new: true })
    if (!sessionBike) {
      throw new Error();
    }
    res.send({ sessionBike });
  } catch (e) {
    res.status(400).send();
  }
})

module.exports=route;
