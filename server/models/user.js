import mongoose from 'mongoose';
import moment from 'moment';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcryptjs';
import constants from '../constants';

import { transporter, verifyEmail, verifyNewEmail } from './../email/mailconfig';


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

UserSchema.methods.generateAuthToken = async () => {
  const access = 'auth';
  const token = jwt.sign({ _id: this._id.toHexString(), access }, process.env.TOKEN.JWT_SECRET_TOKEN, { expiresIn: process.env.TOKEN.DURATION_TOKEN }).toString();

  this.tokens.push({ access, token });
  await this.save();
  return { token };
};

UserSchema.methods.verifyEmailtoken = (newEmail) => {
  const access = 'verifyemail';
  const token = jwt.sign({ _id: this._id.toHexString(), access }, process.env.TOKEN.JWT_SECRET_EMAIL, { expiresIn: process.env.TOKEN.DURATION_EMAIL }).toString()

  const url = `${process.env.SERVER_URL}users/verify/${token}`;
  if(newEmail){
    transporter.sendMail(verifyNewEmail(this, url), (err, info)=>{
      if(err){
        return Promise.reject(502);
      }
      return Promise.resolve();
    })
  } else {
    transporter.sendMail(verifyEmail(this, url), (err, info)=>{
      if(err){
        return Promise.reject(502);
      }
      return Promise.resolve();
    })
  }
};

UserSchema.methods.updateToken = async (token) => {
  const access = 'auth';
  const newtoken = jwt.sign({ _id: this._id.toHexString(), access }, process.env.TOKEN.JWT_SECRET_TOKEN, { expiresIn: process.env.TOKEN.DURATION_TOKEN }).toString();

  this.tokens.find((data) => {
    if(data.token === token){
      data.token = newtoken;
    }
  });
  await this.save();
  return { token: newtoken };
};

UserSchema.methods.removeToken = (token) => 
  this.update({
    $pull:{
      tokens: { token }
    }
});

UserSchema.methods.generatePasswordToken = async () => {
  const user = this;
  const access = 'password';
  const token =jwt.sign({ _id: this._id.toHexString(), access }, process.env.TOKEN.JWT_SECRET_PASSWORD, { expiresIn: process.env.TOKEN.DURATION_PASSWORD }).toString()

  this.resetpasswordtoken = true;
  await this.save();
  return token;
};

UserSchema.statics.findByToken = function (token, userType){
  let decoded;

  try {
    decoded = jwt.verify(token, process.env.TOKEN.JWT_SECRET_TOKEN);
  } catch(e) {
    return Promise.reject(400);
  }

  return this.findOne({
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

export default User;
