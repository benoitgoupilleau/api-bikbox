const mongoose = require('mongoose');
const moment = require('moment');
const pick = require('lodash.pick');
const constants = require('../constants');

const AlertSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    enum: constants.alertStatus,
    default: constants.alertStatus[0],
    required: true
  },
  createdAt: {
    type: Number,
    required: true
  },
  lastUpdatedDate: Number,
  history: [{
    status: String,
    date: Number
  }],
  _station: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Station'
  },
  _parking: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Parking'
  },
  alertType: {
    type: String,
    required: true,
    enum: constants.alertType,
    default: constants.alertType[0],
  },
  _entity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Entity'
  },
  identifier: {
    type: String,
    ref: 'Sensor'
  }
});

AlertSchema.methods.toJSON = function () {
  const alert = this;
  const alertObject = alert.toObject();

  return pick(alertObject, ['_id', 'name', 'description', 'status', 'history', '_station', 'identifier', 'createdAt', 'lastUpdatedDate'])
};

AlertSchema.pre('save', function (next) {
  const alert = this;

  if (alert.isModified('status')) {
    alert.history.push({status: alert.status, date: moment()});
    next();
  } else {
    next();
  }
});

AlertSchema.index({ identifier: 1, name: 1, 'createdAt': 1 }, { unique: true });

const Alert = mongoose.model('Alert', AlertSchema)

module.exports=Alert;
