const express = require('express');
const _ = require('lodash');
const { ObjectID } = require('mongodb');
const moment = require('moment');

const Entity = require('./../models/entity');
const { authenticate, authenticateAdmin, authenticateEntityManager } = require('./../middleware/authenticate');
const constants = require('../constants');

const route = express.Router();

route.post('/entity', authenticateAdmin, (req, res) => {
  const body = _.pick(req.body, ['name', 'description', 'createdAt']);
  const entity = new Entity({
    name: body.name,
    description: body.description,
    createdAt: moment(body.createdAt) && moment()
  })
  entity.save().then((doc) => {
    res.send(doc);
  }, () => {
    res.status(400).send();
  })
});

route.get('/entities', authenticateEntityManager, (req, res) => {
  Entity.find({ active: true }).then((entities) => {
    let filteredEntities = entities; 
    if (req.user.userType === constants.userType[1]) {
      filteredEntities = entities.filter((entity) => user._entity.includes(entity._id))
    }
    res.send(filteredEntities);
  }, () => {
    res.status(400).send();
  })
});

route.get('/entity/:id', authenticate, (req, res) => {
  const id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Entity.findOne({
    _id: id,
    active: true
  }).then((entity) => {
    if (!entity) {
      return res.status(404).send();
    }
    res.send({ entity });
  }, () => {
    res.status(400).send();
  })
});

route.delete('/entity/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }

    const entity = await Entity.findByIdAndUpdate(id, { $set: { active : false, deleteDate: moment() } })
    if (!entity) {
      return res.status(404).send();
    }
    res.status(200).send({ entity });
  } catch (e) {
    res.status(400).send();
  }
});

route.patch('/entity/:id', authenticateAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = _.pick(req.body, ['name', 'description']);

    if (!ObjectID.isValid(id)) {
      return res.status(404).send();
    }
    body.lastUpdatedDate = moment()

    const entity = await Entity.findOneAndUpdate({ _id: id, active: true }, { $set: body }, { new: true })
    if (!entity) {
      throw new Error();
    }
    res.send({ entity });
  } catch (e) {
    res.status(400).send();
  }
})

module.exports=route;
