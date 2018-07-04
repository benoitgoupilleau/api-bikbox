const express = require('express');
const pick = require('lodash.pick');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Entity = require('./../models/entity');
const User = require('./../models/user');
const { authenticate, authenticateAdmin, authenticateEntityManager, knownInstance } = require('./../middleware/authenticate');
const constants = require('../constants');

const logger = require('../helpers/logger');

const route = express.Router();

route.post('/entity/bikbox', knownInstance, async (req, res) => {
  try {
    const entities = await Entity.find({});
    if (entities.length > 0) throw new Error('Already one entity');
    const body = pick(req.body, ['name', 'description', 'createdAt']);
    const entity = new Entity({
      name: body.name,
      description: body.description,
      createdAt: body.createdAt && moment().unix()
    })
    await entity.save();
    res.send({ entity });
  } catch (err) {
    logger.error(err);
    res.status(400).send();
  }
});

route.post('/entity', authenticateAdmin, async (req, res) => {
  try {
    const body = pick(req.body, ['name', 'description', 'createdAt']);
    const entity = new Entity({
      name: body.name,
      description: body.description,
      createdAt: body.createdAt && moment().unix()
    })
    await entity.save();
    await User.findByIdAndUpdate(req.user._id, { $push: { _entity: entity._id } })
    res.send({ entity });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.get('/entities', authenticateEntityManager, async (req, res) => {
  try {
    const entities = await Entity.find({ active: true });
    if (req.user.userType === constants.userType[1]) { // Only filter for non admin user
      return res.send({ entities: entities.filter((entity) => user._entity.includes(entity._id)) })
    }
    res.send(entities);
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.get('/entity/:id', authenticate, async (req, res) => {
  try {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const entity = await Entity.findOne({ _id: id, active: true });
    if (!entity) throw new Error('No entity');

    res.send({ entity });
  } catch (error) {
    logger.error(error);
    res.status(400).send();
  }
});

route.delete('/entity/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    const entity = await Entity.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment().unix() } })
    if (!entity) throw new Error('No entity');

    res.status(200).send({ entity });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

route.patch('/entity/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = pick(req.body, ['name', 'description']);

    if (!ObjectID.isValid(id)) throw new Error('No ObjectId');

    body.lastUpdatedDate = moment().unix()

    const entity = await Entity.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!entity) throw new Error('No entity');

    res.send({ entity });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
})

module.exports=route;
