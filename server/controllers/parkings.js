const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Parking = require('./../models/parking');
const { authenticate, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');

const logger = require('../helpers/logger');

const route = express.Router();

route.post('/parking', authenticateAdmin, async (req, res) => {
  try {
    const body = pick(req.body, ['name', 'description', 'address', '_entity', 'createdAt']);
    const parking = new Parking({
      name: body.name,
      description: body.description,
      address: body.address,
      _entity: body._entity,
      createdAt: body.createdAt && moment().unix()
    })
    await parking.save();
    res.send({ parking });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.get('/parkings', authenticate, async (req, res) => {
  try {
    const parkings = await Parking.find({ active: true, _entity: { $in: req.user._entity } })
    res.send(parkings);
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

route.get('/parking/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const parking = await Parking.findOne({ _id: id, active: true })
    if (!parking) throw new Error('No parking');

    res.send({ parking });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.delete('/parking/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const parking = await Parking.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment().unix() } })
    if (!parking) throw new Error('No parking');

    res.status(200).send({ parking });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

route.patch('/parking/:id', authenticateEntityManager, async (req, res) => {
  try {
    const id = req.params.id;
    const body = pick(req.body, ['name', 'description', 'address', '_entity']);

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    body.lastUpdatedDate = moment().unix()

    const parking = await Parking.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!parking) throw new Error('No parking');

    res.send({ parking });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
})

module.exports=route;
