const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const _ = require('lodash');
const validator = require('validator');

const PersonalInfoSchema = new mongoose.Schema({
  email: {
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
  validatedemail: {
    type: Boolean,
    required: true,
    default: false
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  nbFalsePassword: {
    type: Number,
    required: true,
    default: 0
  }
})

PersonalInfoSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  return _.pick(userObject, ['_id', 'email'])
};

PersonalInfoSchema.statics.findByCredentials = function (email, password) {
  const PersonalInfoSchema = this;

  return PersonalInfoSchema.findOne({ email }).then((personalInfo) => {
    if (!personalInfo) {
      return Promise.reject(400);
    }
    return new Promise((resolve, reject) => {
      if (personalInfo.nbFalsePassword >= process.env.NB_FALSE_PASSWORD) {
        reject(423);
      }
      bcrypt.compare(password, personalInfo.password, (err, result) => {
        if (err) {
          reject(400);
        }
        if (result) {
          resolve(personalInfo);
        } else {
          personalInfo.nbFalsePassword++;
          personalInfo.save();
          reject(401);
        };
      })
    })
  })
};

PersonalInfoSchema.pre('save', function (next) {
  const personalInfo = this;
  if (personalInfo.isModified('password')) {
    bcrypt.genSalt(process.env.TOKEN.SALT_ROUNDS, (err, salt) => {
      if (err) { return next(err) }
      bcrypt.hash(personalInfo.password, salt, (err, hash) => {
        if (err) { return next(err) }
        personalInfo.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const PersonalInfo = mongoose.model('PersonalInfo', PersonalInfoSchema);

module.exports = { PersonalInfo };
