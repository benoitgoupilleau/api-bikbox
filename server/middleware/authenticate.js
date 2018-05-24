const { User } = require('./../models/user');

const authenticate = (req, res,next) => {
  const token = req.header('x-auth');

  User.findByToken(token, 'user').then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user= user;
    req.token =token;
    next();
  }).catch((e)=>{
    res.status(e).send();
  });
};

const authenticateAdmin = (req, res, next) => {
  const token = req.header('x-auth');

  User.findByToken(token, 'admin').then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(e).send();
  });
};

const authenticateEntityManager = (req, res, next) => {
  const token = req.header('x-auth');

  User.findByToken(token, 'entityManager').then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    req.token = token;
    next();
  }).catch((e) => {
    res.status(e).send();
  });
};

const authenticateSensor = (req, res, next) => {
  next();
};

module.exports = { authenticate, authenticateEntityManager, authenticateAdmin, authenticateSensor };
