const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Station = require('./../models/station');
const { authenticate, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/station', authenticateAdmin, (req, res) => {
  const body = pick(req.body, ['name', 'identifier', '_parking', 'firmwareVersion', 'voltage', 'lastChangedBattery', 'createdAt', '_entity']);
  const station = new Station({
    name: body.name,
    identifier: body.identifier,
    _parking: body._parking,
    _entity: body._entity,
    firmwareVersion: body.firmwareVersion,
    voltage: body.voltage,
    lastChangedBattery: body.lastChangedBattery,
    createdAt: moment(body.createdAt) && moment()
  })
  station.save().then((doc) => {
    res.send(doc);
  }, (err) => {
    res.status(400).send(err);
  })
});

route.get('/stations', authenticateEntityManager, async (req, res) => {
  try {
    const stations = await Station.find({ active: true, _entity: { $in: req.user._entity } })
    res.send(stations);
  } catch (e) {
    res.status(400).send(e);
  }
});

route.get('/station/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Station.findOne({
    _id: id,
    active: true
  }).then((station) => {
    if (!station) {
      return res.status(404).send();
    }
    res.send({ station });
  }, () => {
    res.status(400).send();
  })
});

route.delete('/station/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    const station = await Station.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment() } })
    if (!station) {
      return res.status(404).send();
    }
    res.status(200).send({ station });
  } catch (e) {
    res.status(400).send();
  }
});

route.patch('/station/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = pick(req.body, ['name', 'identifier', '_parking', 'firmwareVersion', 'voltage', 'lastChangedBattery']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    body.lastUpdatedDate = moment()

    const station = await Station.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!station) {
      throw new Error();
    }
    res.send({ station });
  } catch (e) {
    res.status(400).send();
  }
})

module.exports=route;
