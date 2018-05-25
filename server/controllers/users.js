import express from 'express';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import User from './../models/user';
import { authenticate } from './../middleware/authenticate';
import { transporter, resetEmail, passwordchangedEmail } from './../email/mailconfig';

const route = express.Router();

//****** USER endpoints ***************************

route.post('/users', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password', 'firstname', 'lastname']);
    const user = new User(body);
    await user.save();
    const {token, tokendate} = await user.generateAuthToken();
    await user.verifyEmailtoken(false);
    res.header({'x-auth': token, 'x-auth-date': tokendate}).send(user);
  } catch (e) {
    res.status(400).send();
  }
});

route.post('/users/update', authenticate, async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password', 'firstname', 'lastname']);
    const user = req.user;
    var passwordchanged = false;
    bcrypt.compare(body.password, user.password, (err, res) => {
      if (!res) {
        bcrypt.genSalt(process.env.TOKEN.SALT_ROUNDS,(err, salt) => {
          if(err){return next(err)}
          bcrypt.hash(body.password, salt, (err, hash) => {
            if (err) {return next(err)}
            user.password=hash;
            user.save().then(() => {
              transporter.sendMail(passwordchangedEmail(user),(err, info) => {
                if(err){
                  return res.status(502).send()
                }
              })
            })
          });
        });
      }
    });
    if(user.email !== body.email) {
      user.email = body.email;
      user.validatedemail=false;
      user.verifyEmailtoken(true);
    };
    user.firstname= body.firstname;
    user.lastname= body.lastname;
    await user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send();
  }
});

route.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

route.post('/users/token', authenticate, async (req, res) => {
  try {
    const {token, tokendate} = await req.user.updateToken(req.token);
    res.header({'x-auth': token,'x-auth-date': tokendate}).send(req.user);
  } catch (e) {
    res.status(e).send();
  }
});

route.post('/users/login', async (req, res) => {
  try {
    const login = _.pick(req.body, ['email', 'password']);
    const user = await User.findByCredentials(login.email, login.password);
    const {token, tokendate} = await user.generateAuthToken();
    res.header({'x-auth': token,'x-auth-date': tokendate}).send(user);
  } catch (e) {
    res.status(e).send();
  }
});

route.delete('/users/me/token', authenticate, async (req, res) => {
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
  jwt.verify(req.params.token, process.env.TOKEN.JWT_SECRET_EMAIL, (err, decoded) => {
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
      var url = process.env.SERVER_URL +'users/reset/' + token;
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
  jwt.verify(req.params.token, process.env.TOKEN.JWT_SECRET_PASSWORD, (err, decoded) => {
    if(err){
      return res.status(400).send(err.message)
    }
    return res.status(200).send()
  })
})

route.post('/users/reset/:token', (req, res) => {
  const password = _.pick(req.body, ['password']).password;
  jwt.verify(req.params.token, process.env.TOKEN.JWT_SECRET_PASSWORD, (err, decoded) => {
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
