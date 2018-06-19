const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const pick = require('lodash.pick');
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
    required: true,
    minlength: 8
  },
  nbFalsePassword: {
    type: Number,
    required: true,
    default: 0
  }
})

PersonalInfoSchema.methods.toJSON = function () {
  const personalInfo = this;
  const personalInfoObject = personalInfo.toObject();

  return pick(personalInfoObject, ['_id', 'email'])
};

PersonalInfoSchema.methods.verifyEmailtoken = function (user) {
  const personalInfo = this;
  const access = 'verifyemail';
  const token = jwt.sign({ _id: personalInfo._id.toHexString(), access }, process.env.TOKEN_JWT_SECRET_EMAIL, { expiresIn: process.env.TOKEN_DURATION_EMAIL }).toString()
  const url = `${process.env.API_URL}users/verify/${token}`;
  transporter.sendMail(verifyEmail(personalInfo.email, url), (err, info) => {
    if (err) {
      return Promise.reject(502);
    }
    return Promise.resolve();
  })
};

PersonalInfoSchema.statics.findByCredentials = function (email, password) {
  const PersonalInfo = this;
  return PersonalInfo.findOne({ email }).then((personalInfo) => {
    if (!personalInfo) {
      return Promise.reject('No personalInfo');
    }
    return new Promise((resolve, reject) => {
      if (personalInfo.nbFalsePassword >= process.env.NB_FALSE_PASSWORD) {
        reject({ message: 'Locked' });
      }
      bcrypt.compare(password, personalInfo.password, (err, result) => {
        if (err) {
          reject({ message: 'Error bcrypt' });
        }
        if (result) {
          resolve(personalInfo);
        } else {
          personalInfo.nbFalsePassword++;
          personalInfo.save();
          reject({ message: 'Wrong password' });
        };
      })
    })
  })
};

PersonalInfoSchema.pre('save', function (next) {
  const personalInfo = this;

  if (personalInfo.isModified('password')) {
    bcrypt.genSalt(parseInt(process.env.TOKEN_SALT_ROUNDS, 10), (err, salt) => {
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

module.exports=PersonalInfo;
