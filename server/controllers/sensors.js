const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Sensor = require('./../models/sensor');
const { authenticate, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/sensor', authenticateAdmin, (req, res) => {
  const body = _.pick(req.body, ['identifier', '_station', 'firmwareVersion', 'voltage', 'lastChangedBattery', 'createdAt']);
  const sensor = new Sensor({
    identifier: body.identifier,
    _station: body._station,
    firmwareVersion: body.firmwareVersion,
    voltage: body.voltage,
    lastChangedBattery: body.lastChangedBattery,
    createdAt: moment(body.createdAt) && moment()
  })
  sensor.save().then((doc) => {
    res.send(doc);
  }, () => {
    res.status(400).send();
  })
});

route.get('/sensors', authenticateEntityManager, (req, res) => {
  Sensor.find({ active: true }).then((sensors) => {
    let filteredSensors = sensors; 
    if (req.user.userType === constants.userType[1]) {
      filteredSensors = sensors.filter((sensor) => user._entity.includes(sensor._id))
    }
    res.send(filteredSensors);
  }, () => {
    res.status(400).send();
  })
});

route.get('/sensor/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Sensor.findOne({
    _id: id,
    active: true
  }).then((sensor) => {
    if (!sensor) {
      return res.status(404).send();
    }
    res.send({ sensor });
  }, () => {
    res.status(400).send();
  })
});

route.delete('/sensor/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    const sensor = await Sensor.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment() } })
    if (!sensor) {
      return res.status(404).send();
    }
    res.status(200).send({ sensor });
  } catch (e) {
    res.status(400).send();
  }
});

route.patch('/sensor/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = _.pick(req.body, ['name', 'identifier', '_parking', 'firmwareVersion', 'voltage', 'lastChangedBattery']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    body.lastUpdatedDate = moment()

    const sensor = await Sensor.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!sensor) {
      throw new Error();
    }
    res.send({ sensor });
  } catch (e) {
    res.status(400).send();
  }
})

module.exports=route;
