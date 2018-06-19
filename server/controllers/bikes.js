const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Bike = require('./../models/bike');
const { authenticate, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');

const logger = require('../helpers/logger');

const route = express.Router();

route.post('/bike', authenticateAdmin, async (req, res) => {
  try {
    const body = pick(req.body, ['identifier', '_entity', '_user', 'createdAt']);
    const bike = new Bike({
      identifier: body.identifier,
      _entity: body._entity,
      _user: body._user,
      createdAt: moment(body.createdAt) && moment()
    })
    bike.save()
    res.send({ bike });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.get('/bikes', authenticateEntityManager, async (req, res) => {
  try {
    const bikes = await Bike.find({ active: true, _entity: { $in: req.user._entity } })
    res.send(bikes);
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

route.get('/bike/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const bike = await Bike.findOne({ _id: id, active: true });
    if (!bike) throw new Error('No bike');

    res.send({ bike });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.delete('/bike/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const bike = await Bike.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment() } })
    if (!bike) throw new Error('No bike');

    res.status(200).send({ bike });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

route.patch('/bike/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = pick(req.body, ['identifier', '_entity', '_user']);

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    body.lastUpdatedDate = moment()

    const bike = await Bike.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!bike) throw new Error('No bike');

    res.send({ bike });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
})

module.exports=route;
