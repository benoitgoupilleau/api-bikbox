import User from './../models/user';
import Sensor from './../models/sensor';
import constants from '../constants';

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
  }).catch(() => {
    res.status(403).send();
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
  const token = req.header('x-auth');

  Station.findByToken(token).then((station) => {
    if (!station) {
      return Promise.reject();
    }
    req.station = station;
    req.token = token;
    next();
  }).catch(() => {
    res.status(403).send();
  });
};

const knownInstance = (req, res, next) => {
  const token = req.header('x-key');
  if (token === process.env.X_KEY) {
    next();
  } else {
    res.status(403).send();
  }
}

export { authenticate, authenticateEntityManager, authenticateAdmin, authenticateStation, knownInstance };
