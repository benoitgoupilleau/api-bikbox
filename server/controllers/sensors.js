const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Sensor = require('./../models/sensor');
const Parking = require('./../models/parking');
const { authenticate, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');

const logger = require('../helpers/logger');

const route = express.Router();

route.post('/sensor', authenticateAdmin, async (req, res) => {
  try {
    const body = pick(req.body, ['identifier', '_station', 'firmwareVersion', 'voltage', 'lastChangedBattery', 'createdAt', '_entity', '_parking']);
    const sensor = new Sensor({
      identifier: body.identifier,
      _station: body._station,
      _parking: body._parking,
      _entity: body._entity,
      firmwareVersion: body.firmwareVersion,
      voltage: body.voltage,
      lastChangedBattery: body.lastChangedBattery,
      createdAt: body.createdAt && moment().unix()
    })
    await sensor.save();
    await Parking.findByIdAndUpdate(body._parking, { $inc: { nbSpot: 1 }})
    res.send({sensor});
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

route.get('/sensors', authenticateEntityManager, async (req, res) => {
  try {
    const sensors = await Sensor.find({ active: true, _entity: { $in: req.user._entity } })
    res.send(sensors);
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

route.get('/sensor/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    const sensor = await Sensor.findOne({ _id: id, active: true });
    if (!sensor) throw new Error('No sensor');
    res.send({ sensor });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.delete('/sensor/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const sensor = await Sensor.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment().unix() } })
    if (!sensor) throw new Error('No sensor');

    await Parking.findByIdAndUpdate(sensor._parking, { $inc: { nbSpot: -1 } })
    
    res.status(200).send({ sensor });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

route.patch('/sensor/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = pick(req.body, ['name', 'identifier', '_parking', 'firmwareVersion', 'voltage', 'lastChangedBattery']);

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');
    body.lastUpdatedDate = moment().unix()

    const sensor = await Sensor.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!sensor) throw new Error('No sensor');

    res.send({ sensor });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
})

module.exports=route;
