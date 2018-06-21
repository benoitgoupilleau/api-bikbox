const express = require('express');
const url = require('url');
const pick = require('lodash.pick');
const moment = require('moment');
const generator = require('generate-password');

const User = require('./../models/user');
const PersonalInfo = require('./../models/personalInfo');
const { authenticate, authenticateAdmin, knownInstance } = require('./../middleware/authenticate');
const { transporter, welcomeEmailPayload, resetPasswordEmailPayload, passwordChangedEmailPayload } = require('./../email/mailconfig');
const constants = require('../constants');

const logger = require('../helpers/logger');

const route = express.Router();

// #### route to add a basic user

route.post('/adminusers/bikbox', knownInstance, async (req, res) => {
  try {
    const users = await User.find({});
    if (users.length > 0) throw new Error('Already one user')
    
    const body = pick(req.body, ['email', '_entity' ]);
    const password = generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      uppercase: true,
      strict: true
    });
    const personalInfo = new PersonalInfo({
      email: body.email,
      password
    })
    await personalInfo.save();

    const user = await new User({
      _id: personalInfo._id,
      _entity: body._entity,
      userType: constants.userType[0],
      createdAt: moment().unix()
    }).save();
    res.status(200).send({ user });
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

//****** Admin USER endpoints ***************************
// ok
route.post('/adminusers', authenticateAdmin, async (req, res) => {
  try {
    const body = pick(req.body, ['email', '_entity', 'userType']);
    
    const password = generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      uppercase: true,
      strict: true
    });
    const personalInfo = new PersonalInfo({
      email: body.email,
      password
    })
    await personalInfo.save();

    const user = await User.create({
      _id: personalInfo._id,
      _entity: body._entity,
      userType: body.userType,
      createdAt: moment().unix()
    });
    
    const token = await user.generatePasswordToken()
    const url = `${process.env.API_URL}/adminusers/resetpassword/${token}`;
    transporter.sendMail(welcomeEmailPayload(body.email, url), (err, info) => {
      if (err) {
        logger.error(err)
      }
      logger.info(info);
    })
    return res.status(200).send(user)
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

// ok
route.post('/adminusers/login', knownInstance, async (req, res) => {
  try {
    const login = pick(req.body, ['email', 'password']);
    const personalInfo = await PersonalInfo.findByCredentials(login.email, login.password);
    const user = await User.findById(personalInfo._id)
    const { token, expiresIn } = await user.generateAuthToken();
    res.header({ 'x-auth': token, 'x-auth-expire': expiresIn }).send(user);
  } catch (e) {
    logger.error(e);
    switch (e.message) {
      case 'Locked':
        return res.status(423).send();
      case 'Wrong password':
        return res.status(401).send();
      default:
        return res.status(400).send();
    }
  }
});

// ok
route.delete('/adminusers/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token)
    res.status(200).send();
  } catch (e) {
    logger.error(e);
    res.status(400).send();
  }
});

// request for new password
route.post('/adminusers/resetpassword', knownInstance, async (req, res) => {
  try {
    const body = pick(req.body, ['email']);
    const personalInfo = await PersonalInfo.findOne({ email: body.email })
    if (!personalInfo) {
      return res.status(404).send();
    }
    const user = await User.findById(personalInfo._id);
    const token = await user.generatePasswordToken();
    const url = `${process.env.API_URL}/adminusers/resetpassword/${token}`;
    transporter.sendMail(resetPasswordEmailPayload(personalInfo.email, url), (err, info) => {
      if (err) {
        logger.error(err)
      }
      logger.info(info);
    })
    return res.status(200).send({ user })
  } catch (error) {
    logger.error(error);
    return res.status(400).send()
  }
});

// route to redirect to screen allowing to update the password
route.get('/adminusers/resetpassword/:token', async (req, res) => {
  try {
    const user = await User.findOne({ 'resetPassword.token': req.params.token })
    if (!user) {
      return res.redirect(url.format({
        pathname: `${process.env.WEB_URL}/notfound`,
        hash: 'nouser'
      }))
    }
    if (user.resetPassword.expiresIn < moment().unix()) {
      return res.redirect(url.format({
        pathname: `${process.env.WEB_URL}/notfound`,
        hash: 'expired',
      }))
    }
    return res.redirect(`${process.env.WEB_URL}/resetpassword/${req.params.token}`);
  } catch (e) {
    logger.error(e);
    return res.redirect(url.format({
      pathname: `${process.env.WEB_URL}/notfound`,
      hash: 'badrequest',
    }))
  }
})

// finale route to save the new password
route.post('/adminusers/resetpassword/:token', async (req, res) => {
  try {
    const password = pick(req.body, ['password']).password;
    const user = await User.findOne({ 'resetPassword.token': req.params.token })
    if (!user) throw new Error('No user')

    if (user.resetPassword.expiresIn < moment().unix()) throw new Error('Token has expired');
    
    const personalInfo = await PersonalInfo.findById(user._id);
    if (!personalInfo) throw new Error('No info');
    
    user.resetPassword = {};
    personalInfo.password = password;
    await personalInfo.save();
    await user.save();
    transporter.sendMail(passwordChangedEmailPayload(personalInfo.email), (err, info) => {
      if (err) {
        logger.error(err)
      }
      logger.info(info);
    })
    return res.status(200).send()
  } catch (err) {
    logger.error(err)
    return res.status(400).send()
  }
})

module.exports=route;
