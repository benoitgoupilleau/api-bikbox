const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Alert = require('./../models/alert');
const Sensor = require('./../models/sensor');
const { authenticateStation, authenticateAdmin } = require('./../middleware/authenticate');
const constants = require('../constants');

const logger = require('../helpers/logger');

const route = express.Router();

route.post('/alert/station', authenticateStation, async (req, res) => {
  try {
    const newAlerts = pick(req.body, ['alerts']).alerts;
    if (!newAlerts || !Array.isArray(newAlerts)) throw new Error('No alerts array');

    const alertsToSave = [];
    const failedAlerts = []
    for (let i = 0; i < newAlerts.length; i += 1) {
      const alert = await Alert.findOne({ identifier: newAlerts[i].identifier, name: newAlerts[i].name, createdAt: newAlerts[i].createdAt })

      if (alert || !constants.alertType.includes(newAlerts[i].alertType)) {
        failedAlerts.push(newAlerts[i])
      } else {
        if (newAlerts[i].alertType === constants.alertType[0]) {
          const sensor = await Sensor.findOne({ identifier: newAlerts[i].identifier, _station: req.station._id })
          if (sensor) {
            const alert = new Alert({
              name: newAlerts[i].name,
              description: newAlerts[i].description,
              alertType: constants.alertType[0],
              _parking: req.station._parking,
              _entity: req.station._entity,
              _station: req.station._id,
              identifier: newAlerts[i].identifier,
              createdAt: newAlerts[i].createdAt && moment().unix()
            })
            alertsToSave.push(alert.save())
          } else {
            failedAlerts.push(newAlerts[i])
          }
        } 
        if (newAlerts[i].alertType === constants.alertType[1]) {
          const alert = new Alert({
            name: newAlerts[i].name,
            description: newAlerts[i].description,
            alertType: constants.alertType[1],
            _parking: req.station._parking,
            _station: req.station._id,
            identifier: req.station.identifier,
            _entity: req.station._entity,
            createdAt: newAlerts[i].createdAt && moment().unix()
          })
          alertsToSave.push(alert.save())
        }
      }
    }
    await Promise.all(alertsToSave)
    if (failedAlerts.length > 0) logger.warn(`failedAlerts ${JSON.stringify(failedAlerts)}`)
    // { alerts: pick(result, ['_id', 'name', 'description', 'status', 'identifier', 'createdAt', 'alertType']) }
    res.status(200).send()
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
});

route.get('/alerts', authenticateAdmin, async (req, res) => {
  try {
    const alerts = await Alert.find({ _entity: { $in: req.user._entity }, status: { $ne: 'closed'} })
    res.send(alerts);
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
});

route.get('/alert/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const alert = await Alert.findOne({ _id: id })
    if (!alert) throw new Error('No alert');

    res.send({ alert });
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
});

route.patch('/alert/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = pick(req.body, ['name', 'description', 'identifier', 'status']);

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    body.lastUpdatedDate = moment().unix()
    
    const alert = await Alert.findOne({ _id: id})
    if (!alert) throw new Error('No alert');

    if (body.status && constants.alertStatus.includes(body.status) && body.status !== alert.status) alert.status = body.status;
    if (body.name && body.name !== '' && body.name !== alert.name) alert.name = body.name;
    if (body.description && body.description !== '' && body.description !== alert.description) alert.description = body.description;
    if (body.identifier && body.identifier !== '' && body.identifier !== alert.identifier) alert.identifier = body.identifier;

    await alert.save();

    res.send({ alert });
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
})

module.exports=route;
