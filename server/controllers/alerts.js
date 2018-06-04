const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Alert = require('./../models/alert');
const { authenticateStation, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/alert', authenticateStation, (req, res) => {
  const body = _.pick(req.body, ['name', 'description', '_sensor', 'createdAt']);
  const alert = new Alert({
    name: body.name,
    description: body.description,
    _station: req.station._id,
    _sensor: body._sensor,
    _user: body._user,
    createdAt: moment(body.createdAt) && moment()
  })
  alert.save().then((doc) => {
    res.send(doc);
  }, () => {
    res.status(400).send();
  })
});

route.get('/alerts', authenticateAdmin, (req, res) => {
  Alert.find({}).then((alerts) => {
    let filteredAlerts = alerts; 
    res.send(filteredAlerts);
  }, () => {
    res.status(400).send();
  })
});

route.get('/alert/:id', authenticateAdmin, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Alert.findOne({ _id: id }).then((alert) => {
    if (!alert) {
      return res.status(404).send();
    }
    res.send({ alert });
  }, () => {
    res.status(400).send();
  })
});

route.patch('/alert/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = _.pick(req.body, ['name', 'description', '_sensor', 'status']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    body.lastUpdatedDate = moment()
    
    const alert = await Alert.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!alert) {
      throw new Error();
    }
    res.send({ alert });
  } catch (e) {
    res.status(400).send();
  }
})

module.exports=route;
