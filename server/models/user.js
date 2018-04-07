const mongoose=require('mongoose');
const moment = require('moment');
const validator= require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var {transporter, verifyEmail, verifyNewEmail} = require('./../email/mailconfig');

const durationtemptoken = 7; //days(s)
const durationpasswordtoken = "30m";
const durationemailtoken = "12h";

var UserSchema= new mongoose.Schema({
  firstname:{
    type: String,
    required: true,
    trim: true,
  },
  lastname:{
    type: String,
    required: true,
    trim: true,
  },
  email:{
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      isAsync: true,
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  validatedemail:{
    type: Boolean,
    required: true,
    default: false
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  nbFalsePassword:{
    type: Number,
    required: true,
    default: 0
  },
  billing:{
    type: String,
    required: true,
    default: 'Free'
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
    },
    tokendate: {
      type: Number,
      required: true
    }
  }]
});

UserSchema.methods.toJSON = function (){
  var user = this;
  var userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email'])
};

UserSchema.methods.generateAuthToken = async function (){
  var user = this;
  var access = 'auth';
  var token = jwt.sign({_id: user._id.toHexString(), access},process.env.JWT_SECRET).toString(); // add duration to it
  var tokendate =  moment().add(durationtemptoken,'d').valueOf();

  user.tokens.push({access, token, tokendate});
  await user.save();
  return { token, tokendate};
};

UserSchema.methods.verifyEmailtoken = function(newEmail){
  var user= this;
  var access = 'verifyemail';
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET_EMAIL,{expiresIn: durationemailtoken}).toString()

  var url = process.env.SERVER_URL +'users/verify/' + token;
  if(newEmail){
    transporter.sendMail(verifyNewEmail(user,url), (err, info)=>{
      if(err){
        return Promise.reject(502);
      }
      return Promise.resolve();
    })
  } else {
    transporter.sendMail(verifyEmail(user,url), (err, info)=>{
      if(err){
        return Promise.reject(502);
      }
      return Promise.resolve();
    })
  }
};

UserSchema.methods.updateToken = async function(token){
  var user= this;
  var access = 'auth';
  var newtoken = jwt.sign({_id: user._id.toHexString(), access},process.env.JWT_SECRET).toString(); // add duration to it
  var newtokendate =  moment().add(durationtemptoken,'d').valueOf();

  user.tokens.find((data)=>{
    if(data.token === token){
      data.token= newtoken;
      data.tokendate = newtokendate;
    }
  })
  await user.save();
  return {token: newtoken, tokendate: newtokendate};
};

UserSchema.methods.removeToken = function (token){
  var user = this;

  return user.update({
    $pull:{
      tokens: {token}
    }
  })
};

UserSchema.methods.generatePasswordToken = async function (){
  var user = this;
  var access = 'password';
  var token =jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET_PASSWORD,{expiresIn: durationpasswordtoken}).toString()

  user.resetpasswordtoken =true;
  await user.save();
  return token;
};

UserSchema.statics.findByToken = function (token){
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch(e){
    return Promise.reject(400);
  }

  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  }).then((user)=>{
    if(!user){
      return Promise.reject(400);
    }
    var tokens= user.tokens.find((data)=> data.token ===token);
    if (tokens.tokendate < moment().valueOf()){
      return user.removeToken(token).then(()=>{
        return Promise.reject(403);
      });
    } else {
      return user;
    }
  });
};

UserSchema.statics.findByCredentials = function (email, password){
  var User = this;

  return User.findOne({email}).then((user)=>{
    if (!user) {
      return Promise.reject(400);
    }
    return new Promise((resolve, reject)=>{
      if(user.nbFalsePassword >= process.env.NB_FALSE_PASSWORD) {
        reject(423);
      }
      bcrypt.compare(password, user.password, (err, result)=>{
        if (err) {
          reject(400);}
        if (result) {
          resolve(user);
        } else {
          user.nbFalsePassword++;
          user.save();
          reject(401);
        };
      })
    })
  })
};

UserSchema.pre('save', function (next){
  var user= this;
  if(user.isModified('password')){
    bcrypt.genSalt(12,(err, salt)=>{
      if(err){return next(err)}
      bcrypt.hash(user.password, salt, (err, hash)=>{
        if (err) {return next(err)}
        user.password=hash;
        next();
      });
    });
  } else {
    next();
  }
});


var User = mongoose.model('User', UserSchema);

module.exports={User};
