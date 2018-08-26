const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const uuidv4 = require('uuid/v4');
const pick = require('lodash.pick');
const constants = require('../constants');

const UserSchema= new mongoose.Schema({
  _id: {
    ref: 'PersonalInfo',
    type: mongoose.Schema.Types.ObjectId
  },
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
  resetPassword:{
    token: {
      type: String,
    },
    expiresIn: {
      type: Number
    }
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

  return pick(userObject, ['_id', 'userType', '_entity'])
};

// ok
UserSchema.methods.generateAuthToken = async function () {
  const user = this;
  const access = 'auth';
  const expiresIn = moment().add(process.env.TOKEN_DURATION_TOKEN, 'd').unix()
  const token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.TOKEN_JWT_SECRET_TOKEN, { expiresIn }).toString();

  user.tokens.push({ access, token });
  await user.save();
  return { token, expiresIn };
};

// ok
UserSchema.methods.removeToken = async function (token) {
  const user = this;
  // await user.update({
  //   $set: {
  //     tokens: []
  //   }
  // });
  await user.update({
    $pull: {
      tokens: { token }
    }
  });
} 
  
// ok 
UserSchema.methods.generatePasswordToken = async function () {
  const user = this;
  const token = uuidv4()

  user.resetPassword = {
    token,
    expiresIn: moment().add(process.env.TOKEN_DURATION_PASSWORD, 'h').unix()
  };

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
