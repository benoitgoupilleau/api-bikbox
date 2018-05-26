import express from 'express';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import moment from 'moment';
import generator from 'generate-password';

import User from './../models/user';
import PersonalInfo from './../models/personalInfo'
import { authenticate, authenticateAdmin } from './../middleware/authenticate';
import { transporter, resetEmail, passwordchangedEmail } from './../email/mailconfig';

const route = express.Router();

//****** USER endpoints ***************************

route.post('/users', async (req, res) => {
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
    res.status(200).send(user)
  } catch (e) {
    console.log(e)
    res.status(400).send();
  }
});

route.post('/users/login', async (req, res) => {
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

route.delete('/users/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token)
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

route.post('/users/verify', (req, res) => {
  const body = _.pick(req.body, ['email']);
  User.findOne({email: body.email}).then((user) => {
    if(!user){
      return res.status(404).send();
    }
    if(!user.validatedemail){
      user.verifyEmailtoken(false).then(() => {
        return res.status(200).send()
      }).catch((e) => {
        return res.status(502).send()
      })
    } else{
      return res.status(400).send();
    }
  })
})

route.get('/users/verify/:token', (req, res) => {
  jwt.verify(req.params.token, process.env.TOKEN_JWT_SECRET_EMAIL, (err, decoded) => {
    if(err){
      return res.status(400).send(err.message)
    }
    User.findOne({_id: decoded._id}).then((user) => {
      user.validatedemail=true;
      user.save().then(() => {
        return res.status(200).send()
      })
    }).catch((e) => {
      return res.status(400).send(e.message)
    })
  })
})

route.post('/users/forgot', async (req, res) => {
  const body = _.pick(req.body, ['email']);
  User.findOne({email: body.email}).then((user) => {
    if(!user){
      return res.status(404).send();
    }
    user.generatePasswordToken().then((token) => {
      const url = process.env.SERVER_URL +'users/reset/' + token;
      transporter.sendMail(resetEmail(user,url), (err, info) => {
        if(err){
          return res.status(502).send()
        }
        return res.status(200).send()
      })
    })
  })
});

route.get('/users/reset/:token', (req, res) => {
  jwt.verify(req.params.token, process.env.TOKEN_JWT_SECRET_PASSWORD, (err, decoded) => {
    if(err){
      return res.status(400).send(err.message)
    }
    return res.status(200).send()
  })
})

route.post('/users/reset/:token', (req, res) => {
  const password = _.pick(req.body, ['password']).password;
  jwt.verify(req.params.token, process.env.TOKEN_JWT_SECRET_PASSWORD, (err, decoded) => {
    if(err){
      return res.status(400).send(err.message)
    }

    User.findOne({_id: decoded._id, resetpasswordtoken: true}).then((user) => {
      if(!user){
        return res.status(404).send();
      }
      user.password=password;
      user.resetpasswordtoken=undefined;
      user.save().then(() => {
        transporter.sendMail(passwordchangedEmail(user),(err, info) => {
          if(err){
            return res.status(502).send()
          }
          return res.status(200).send()
        })
      })
    })
  })
})

export default route;
