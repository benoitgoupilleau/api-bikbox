const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const constants = require('../constants');

const { transporter } = require('./../email/mailconfig');


const UserSchema= new mongoose.Schema({
  _entity: [{
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Entity'
  }],
  userType:{
    type: String,
    required: true,
    enum: constants.userType,
    default: 'user'
  },
  createdAt: {
    type: Number,
    required: true
  },
  resetpasswordtoken:{
    default: true,
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

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'userType'])
};

// ok
UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const access = 'auth';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.TOKEN_JWT_SECRET_TOKEN, { expiresIn: process.env.TOKEN_DURATION_TOKEN }).toString();

  user.tokens.push({ access, token });
  await user.save();
  return token;
};

// ok
UserSchema.methods.removeToken = function (token) {
  const user = this;
  user.update({
    $pull: {
      tokens: { token }
    }
  });
} 
  
// ok 
UserSchema.methods.generatePasswordToken = async function () {
  const user = this;
  const access = 'password';
  const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.TOKEN_JWT_SECRET_PASSWORD, { expiresIn: process.env.TOKEN_DURATION_PASSWORD }).toString()

  user.resetpasswordtoken = true;
  await user.save();
  return token;
};

UserSchema.statics.findByToken = function (token, userType){
  const User = this;
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.TOKEN_JWT_SECRET_TOKEN);
  } catch(e) {
    return Promise.reject(400);
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
    userType: { $in: userType}
  }).then((user) => {
    if(!user) {
      return Promise.reject(400);
    }
    return user;
  });
};

const User = mongoose.model('User', UserSchema);

module.exports=User;
