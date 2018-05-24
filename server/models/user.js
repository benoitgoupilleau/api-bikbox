const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const { transporter, verifyEmail, verifyNewEmail } = require('./../email/mailconfig');


const UserSchema= new mongoose.Schema({
  _personalInfo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'PersonalInfo'
  },
  _entity: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Entity'
  }],
  userType:{
    type: String,
    required: true,
    enum: ['user', 'entityManager', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Number,
    required: true
  },
  resetpasswordtoken:{
    type: Boolean
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }],
  active: {
    type: Boolean,
    required: true,
    default: true
  }
});

UserSchema.methods.toJSON = () => {
  const userObject = this.toObject();

  return _.pick(userObject, ['_id', 'userType'])
};

UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.TOKEN.JWT_SECRET_TOKEN, { expiresIn: process.env.TOKEN.DURATION_TOKEN }).toString();

  user.tokens.push({ access, token });
  await user.save();
  return { token };
};

UserSchema.methods.verifyEmailtoken = function (newEmail) {
  const user= this;
  const access = 'verifyemail';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.TOKEN.JWT_SECRET_EMAIL, { expiresIn: process.env.TOKEN.DURATION_EMAIL }).toString()

  const url = `${process.env.SERVER_URL}users/verify/${token}`;
  if(newEmail){
    transporter.sendMail(verifyNewEmail(user, url), (err, info)=>{
      if(err){
        return Promise.reject(502);
      }
      return Promise.resolve();
    })
  } else {
    transporter.sendMail(verifyEmail(user, url), (err, info)=>{
      if(err){
        return Promise.reject(502);
      }
      return Promise.resolve();
    })
  }
};

UserSchema.methods.updateToken = async function (token) {
  const user= this;
  const access = 'auth';
  const newtoken = jwt.sign({ _id: user._id.toHexString(), access }, process.env.TOKEN.JWT_SECRET_TOKEN, { expiresIn: process.env.TOKEN.DURATION_TOKEN }).toString();

  user.tokens.find((data) => {
    if(data.token === token){
      data.token = newtoken;
    }
  });
  await user.save();
  return { token: newtoken };
};

UserSchema.methods.removeToken = (token) => 
  this.update({
    $pull:{
      tokens: { token }
    }
});

UserSchema.methods.generatePasswordToken = async function () {
  const user = this;
  const access = 'password';
  const token =jwt.sign({ _id: user._id.toHexString(), access }, process.env.TOKEN.JWT_SECRET_PASSWORD, { expiresIn: process.env.TOKEN.DURATION_PASSWORD }).toString()

  user.resetpasswordtoken = true;
  await user.save();
  return token;
};

UserSchema.statics.findByToken = function (token, userType){
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.TOKEN.JWT_SECRET_TOKEN);
  } catch(e) {
    return Promise.reject(400);
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
    userType
  }).then((user) => {
    if(!user) {
      return Promise.reject(400);
    }
    return user;
  });
};

var User = mongoose.model('User', UserSchema);

module.exports={User};
