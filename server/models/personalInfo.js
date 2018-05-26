import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import _ from 'lodash';
import validator from 'validator';

const PersonalInfoSchema = new mongoose.Schema({
  _id: {
    ref: 'User',
    type: mongoose.Schema.Types.ObjectId
  },
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

PersonalInfoSchema.methods.toJSON = () => {
  const personalInfoObject = this.toObject();

  return _.pick(personalInfoObject, ['_id', 'email'])
};

PersonalInfoSchema.statics.findByCredentials = (email, password) => {

  return this.findOne({ email }).then((personalInfo) => {
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

PersonalInfoSchema.pre('save', (next) => {
  if (this.isModified('password')) {
    bcrypt.genSalt(process.env.TOKEN.SALT_ROUNDS, (err, salt) => {
      if (err) { return next(err) }
      bcrypt.hash(this.password, salt, (err, hash) => {
        if (err) { return next(err) }
        this.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const PersonalInfo = mongoose.model('PersonalInfo', PersonalInfoSchema);

export default PersonalInfo;
