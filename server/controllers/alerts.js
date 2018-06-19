const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Alert = require('./../models/alert');
const { authenticateStation, authenticateAdmin } = require('./../middleware/authenticate');
const constants = require('../constants');

const logger = require('../helpers/logger');

const route = express.Router();

route.post('/alert/station', authenticateStation, async (req, res) => {
  try {
    const alerts = pick(req.body, ['alerts']).alerts;
    if (!alerts || !Array.isArray(alerts)) throw new Error('No alerts array');

    const alertsToSave = [];
    const failedAlerts = []
    for (let i = 0; i < alerts.length; i += 1) {
      const alert = await Alert.findOne({ identifier: sessionPlaces[i].identifier, name: sessionPlaces[i].name, createdAt: sessionPlaces[i].createdAt })

      if (alert) {
        failedAlerts.push({
          identifier: sessionPlaces[i].identifier,
          name: sessionPlaces[i].name,
          createdAt: sessionPlaces[i].createdAt
        })
      } else {
        if (sessionPlaces[i].alertType === constants.alertStatus[0]) {
          const sensor = await Sensor.findOne({ identifier: sessionPlaces[i].identifier, _station: req.station._id })
          if (sensor) {
            const alert = new Alert({
              name: sessionPlaces[i].name,
              description: sessionPlaces[i].description,
              alertType: constants.alertStatus[0],
              _parking: req.station._parking,
              _entity: req.station._entity,
              identifier: sessionPlaces[i].identifier,
              createdAt: moment(sessionPlaces[i].createdAt) && moment()
            })
            alertsToSave.push(alert.save())
          } else {
            failedAlerts.push({
              identifier: sessionPlaces[i].identifier,
              name: sessionPlaces[i].name,
              createdAt: sessionPlaces[i].createdAt
            })
          }
        }
        if (sessionPlaces[i].alertType === constants.alertStatus[1]) {
          const alert = new Alert({
            name: sessionPlaces[i].name,
            description: sessionPlaces[i].description,
            alertType: constants.alertStatus[1],
            _parking: req.station._parking,
            _station: req.station._id,
            _entity: req.station._entity,
            createdAt: moment(sessionPlaces[i].createdAt) && moment()
          })
          alertsToSave.push(alert.save())
        }
      }
    }
    const result = await Promise.all(alertsToSave)
    res.send({alerts: pick(result, ['_id', 'name', 'description', 'status', 'history', '_station', 'identifier', 'createdAt', 'lastUpdatedDate', 'alertType'])})
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
});

route.get('/alerts', authenticateAdmin, async (req, res) => {
  try {
    const alerts = await Alert.find({ _entity: { $in: req.user._entity } })
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

    body.lastUpdatedDate = moment()
    
    const alert = await Alert.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!alert) throw new Error('No alert');

    res.send({ alert });
  } catch (e) {
    logger.error(e)
    res.status(400).send();
  }
})

module.exports=route;
