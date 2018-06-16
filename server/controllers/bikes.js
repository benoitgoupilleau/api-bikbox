const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Bike = require('./../models/bike');
const { authenticate, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/bike', authenticateAdmin, (req, res) => {
  const body = pick(req.body, ['identifier', '_entity', '_user', 'createdAt']);
  const bike = new Bike({
    identifier: body.identifier,
    _entity: body._entity,
    _user: body._user,
    createdAt: moment(body.createdAt) && moment()
  })
  bike.save().then((doc) => {
    res.send(doc);
  }, () => {
    res.status(400).send();
  })
});

route.get('/bikes', authenticateEntityManager, async (req, res) => {
  try {
    const bikes = await Bike.find({ active: true, _entity: { $in: req.user._entity } })
    res.send(bikes);
  } catch (e) {
    res.status(400).send(e);
  }
});

route.get('/bike/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Bike.findOne({
    _id: id,
    active: true
  }).then((bike) => {
    if (!bike) {
      return res.status(404).send();
    }
    res.send({ bike });
  }, () => {
    res.status(400).send();
  })
});

route.delete('/bike/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    const bike = await Bike.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment() } })
    if (!bike) {
      return res.status(404).send();
    }
    res.status(200).send({ bike });
  } catch (e) {
    res.status(400).send();
  }
});

route.patch('/bike/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = pick(req.body, ['identifier', '_entity', '_user']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    body.lastUpdatedDate = moment()

    const bike = await Bike.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!bike) {
      throw new Error();
    }
    res.send({ bike });
  } catch (e) {
    res.status(400).send();
  }
})

module.exports=route;
