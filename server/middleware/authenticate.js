const User = require('./../models/user');
const Station = require('./../models/station');
const constants = require('../constants');

const authenticate = (req, res,next) => {
  const token = req.header('x-auth');

  User.findByToken(token, constants.userType).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user= user;
    req.token =token;
    next();
  }).catch(()=>{
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
    next();
  }).catch((e) => {
    res.status(403).send(e);
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
    next();
  }).catch(() => {
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
    next();
  }).catch(() => {
    res.status(403).send();
  });
};

const knownInstance = (req, res, next) => {
  const token = req.header('x-key');
  if (token && token === process.env.X_KEY) {
    next();
  } else {
    res.status(403).send();
  }
}

module.exports={ authenticate, authenticateEntityManager, authenticateAdmin, authenticateStation, knownInstance };
