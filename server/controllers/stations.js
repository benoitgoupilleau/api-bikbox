const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Station = require('./../models/station');
const { authenticate, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');

const logger = require('../helpers/logger');

const route = express.Router();

route.post('/station', authenticateAdmin, async (req, res) => {
  try {
    const body = pick(req.body, ['name', 'identifier', '_parking', 'firmwareVersion', 'voltage', 'lastChangedBattery', 'createdAt', '_entity']);
    const station = new Station({
      name: body.name,
      identifier: body.identifier,
      _parking: body._parking,
      _entity: body._entity,
      firmwareVersion: body.firmwareVersion,
      voltage: body.voltage,
      lastChangedBattery: body.lastChangedBattery,
      createdAt: body.createdAt && moment().unix()
    })
    await station.save();
    res.send({ station });
  } catch (error) {
    logger.error(error)
    res.status(400).send();
  }
});

route.get('/stations', authenticateEntityManager, async (req, res) => {
  try {
    const stations = await Station.find({ active: true, _entity: { $in: req.user._entity } })
    res.send(stations);
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
});

route.get('/station/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const station = await Station.findOne({ _id: id, active: true });
    if (!station) throw new Error('No station')
    res.send({ station });
  } catch (error) {
    logger.error(error)
    res.status(400).send();
  }
});

route.delete('/station/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const station = await Station.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment().unix() } })
    if (!station) throw new Error('No station');

    res.status(200).send({ station });
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
});

route.patch('/station/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = pick(req.body, ['name', 'identifier', '_parking', 'firmwareVersion', 'voltage', 'lastChangedBattery']);

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');
    
    body.lastUpdatedDate = moment().unix()

    const station = await Station.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!station) throw new Error('No station');

    res.send({ station });
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
})

module.exports=route;
