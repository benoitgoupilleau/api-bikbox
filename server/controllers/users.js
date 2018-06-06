const express = require('express');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const moment = require('moment');
const generator = require('generate-password');

const User = require('./../models/user');
const PersonalInfo = require('./../models/personalInfo');
const { authenticate, authenticateAdmin, knownInstance } = require('./../middleware/authenticate');
const { transporter, welcomeEmailPayload, resetPasswordEmailPayload, passwordChangedEmailPayload } = require('./../email/mailconfig');
const constants = require('../constants');

const route = express.Router();

// #### route to add a basic user

route.post('/adminusers/bikbox', knownInstance, async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', '_entity' ]);

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
      createdAt: moment()
    }).save();
    res.status(200).send(user);
  } catch (e) {
    console.log(e)
    res.status(400).send();
  }
});

//****** Admin USER endpoints ***************************
// ok
route.post('/adminusers', authenticateAdmin, async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', '_entity', 'userType']);
    
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
      createdAt: moment()
    });
    
    const token = await user.generatePasswordToken()
    const url = `${process.env.API_URL}/adminusers/resetpassword/${token}`;
    transporter.sendMail(welcomeEmailPayload(body.email, url), (err, info) => {
      if (err) {
        console.log({err, info})
        return res.status(502).send(err)
      }
      return res.status(200).send(user)
    })
  } catch (e) {
    console.log(e)
    res.status(400).send();
  }
});

// ok
route.post('/adminusers/login', knownInstance, async (req, res) => {
  try {
    const login = _.pick(req.body, ['email', 'password']);
    const personalInfo = await PersonalInfo.findByCredentials(login.email, login.password);
    const user = await User.findById(personalInfo._id)
    const token = await user.generateAuthToken();
    res.header({ 'x-auth': token }).send(user);
  } catch (e) {
    res.status(e).send();
  }
});

// ok
route.delete('/adminusers/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token)
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

// request for new password
route.post('/adminusers/resetpassword', knownInstance, async (req, res) => {
  try {
    const body = _.pick(req.body, ['email']);
    const personalInfo = await PersonalInfo.findOne({ email: body.email })
    if (!personalInfo) {
      return res.status(404).send();
    }
    const user = await User.findById(personalInfo._id);
    const token = await user.generatePasswordToken();
    const url = `${process.env.API_URL}/adminusers/resetpassword/${token}`;
    transporter.sendMail(resetPasswordEmailPayload(personalInfo.email, url), (err, info) => {
      if (err) {
        return res.status(502).send(err)
      }
      return res.status(200).send()
    })
  } catch (error) {
    return res.status(400).send(error)
  }
});

// route to redirect to screen allowing to update the password
route.get('/adminusers/resetpassword/:token', (req, res) => {
  jwt.verify(req.params.token, process.env.TOKEN_JWT_SECRET_PASSWORD, (err, decoded) => {
    if(err){
      return res.status(400).send(err.message)
    }
    return res.redirect(`${process.env.WEB_URL}/resetpassword/${req.params.token}`);
  })
})

// finale route to save the new password
route.post('/adminusers/resetpassword/:token', async (req, res) => {
  console.log("here")
  const password = _.pick(req.body, ['password']).password;
  jwt.verify(req.params.token, process.env.TOKEN_JWT_SECRET_PASSWORD, async (err, decoded) => {
    if(err){
      console.log(err)
      return res.status(400).send(err)
    }

    const user = await User.findOne({ _id: decoded._id, resetpasswordtoken: true})
    if(!user){
      return res.status(404).send('No user');
    }
    const personalInfo = await PersonalInfo.findById(user._id);
    if (!personalInfo) {
      return res.status(404).send('No info');
    }
    personalInfo.password = password;
    await personalInfo.save();

    user.resetpasswordtoken=false;
    user.save().then(() => {
      transporter.sendMail(passwordChangedEmailPayload(personalInfo.email), (err, info) => {
        if(err){
          return res.status(502).send()
        }
        return res.status(200).send()
      })
    })
  })
})

module.exports=route;
