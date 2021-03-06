const User = require('./../models/user');
const Station = require('./../models/station');
const constants = require('../constants');
const logger = require('../helpers/logger');

const authenticate = (req, res,next) => {
  const token = req.header('x-auth');

  User.findByToken(token, constants.userType).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user= user;
    req.token =token;
    logger.info(`authenticate: ${user._id}`)
    next();
  }).catch((e)=>{
    logger.warn(`authenticate: 403 ${e}`)
    res.status(403).send();
  });
};

const authenticateAdmin = (req, res, next) => {
  const token = req.header('x-auth');
  
  User.findByToken(token, [constants.userType[2]]).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    logger.info(`authenticateAdmin: ${user._id}`)
    next();
  }).catch((e) => {
    logger.warn(`authenticateAdmin: 403 ${e}`)
    res.sendStatus(403)
  });
};

const authenticateEntityManager = (req, res, next) => {
  const token = req.header('x-auth');

  User.findByToken(token, [constants.userType[1], constants.userType[2]]).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    logger.info(`authenticateEntityManager: ${user._id}`)
    next();
  }).catch((e) => {
    logger.warn(`authenticateEntityManager: 403 ${e}`)
    res.status(403).send();
  });
};

const authenticateStation = (req, res, next) => {
  const identifier = req.header('x-auth');

  Station.findOne({ identifier, active: true }).then((station) => {
    if (!station) {
      return Promise.reject();
    }
    req.station = station;
    logger.info(`authenticateStation: ${station._id}`)
    next();
  }).catch((e) => {
    logger.warn(`authenticateStation: 403 ${e}`)
    res.status(403).send();
  });
};

const knownInstance = (req, res, next) => {
  const token = req.header('x-key');
  if (token && token === process.env.X_KEY) {
    logger.info('knownInstance')
    next();
  } else {
    logger.warn('knownInstance: 403')
    res.status(403).send();
  }
}

module.exports={ authenticate, authenticateEntityManager, authenticateAdmin, authenticateStation, knownInstance };
