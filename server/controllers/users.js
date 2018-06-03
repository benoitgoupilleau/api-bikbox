import express from 'express';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import generator from 'generate-password';

import User from './../models/user';
import PersonalInfo from './../models/personalInfo'
import { authenticate, authenticateAdmin, knownInstance } from './../middleware/authenticate';
import { transporter, welcomeEmailPayload, resetPasswordEmailPayload, passwordChangedEmailPayload } from './../email/mailconfig';

const route = express.Router();

//****** Admin USER endpoints ***************************
// ok
route.post('/adminusers', knownInstance, async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', '_entity', 'userType']);
    const user = await User.create({
      _entity: body._entity,
      userType: body.userType,
      createdAt: moment()
    });

    const password = generator.generate({
      length: 8,
      numbers: true,
      symbols: true,
      uppercase: true,
      strict: true
    });
    const personalInfo = new PersonalInfo({
      _id: user._id,
      email: body.email,
      password
    })
    await personalInfo.save();
    const token = await user.generatePasswordToken()
    const url = process.env.WEB_URL + 'users/reset/' + token;
    transporter.sendMail(welcomeEmailPayload(user, url), (err, info) => {
      if (err) {
        return res.status(502).send()
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
    const url = `${process.env.API_URL}/resetpassword/${token}`;
    transporter.sendMail(resetPasswordEmailPayload(user, url), (err, info) => {
      if (err) {
        return res.status(502).send()
      }
      return res.status(200).send()
    })
  } catch (error) {
    return res.status(400).send()
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
route.post('/adminusers/resetpassword/:token', knownInstance, async (req, res) => {
  const password = _.pick(req.body, ['password']).password;
  jwt.verify(req.params.token, process.env.TOKEN_JWT_SECRET_PASSWORD, async (err, decoded) => {
    if(err){
      return res.status(400).send(err.message)
    }

    const user = await User.findOne({ _id: decoded._id, resetpasswordtoken: true})
    if(!user){
      return res.status(404).send();
    }
    const personalInfo = await PersonalInfo.findById(user._id);
    if (!personalInfo) {
      return res.status(404).send();
    }
    personalInfo.password = password;
    await personalInfo.save();

    user.resetpasswordtoken=false;
    user.save().then(() => {
      transporter.sendMail(passwordChangedEmailPayload(user), (err, info) => {
        if(err){
          return res.status(502).send()
        }
        return res.status(200).send()
      })
    })
  })
})

export default route;
