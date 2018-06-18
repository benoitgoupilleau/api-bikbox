const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Alert = require('./../models/alert');
const { authenticateStation, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/alert/station', authenticateStation, async (req, res) => {
  try {
    const body = pick(req.body, ['name', 'description', 'identifier', 'createdAt']);
    const alert = new Alert({
      name: body.name,
      description: body.description,
      _station: req.station._id,
      _entity: req.station._entity,
      identifier: body.identifier,
      createdAt: moment(body.createdAt) && moment()
    })
    await alert.save()
    res.send({alert: pick(alert, ['_id', 'name', 'description', 'status', 'history', '_station', 'identifier', 'createdAt', 'lastUpdatedDate'])})
  } catch (e) {
    res.status(400).send(e);
  }
});

route.get('/alerts', authenticateAdmin, async (req, res) => {
  try {
    const alerts = await Alert.find({ _entity: { $in: req.user._entity } })
    res.send(alerts);
  } catch (e) {
    res.status(400).send(e);
  }
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
    const body = pick(req.body, ['name', 'description', 'identifier', 'status']);

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
