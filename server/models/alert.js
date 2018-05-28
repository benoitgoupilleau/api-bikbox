import mongoose from 'mongoose';
import moment from 'moment';
import constants from '../constants';

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
    required: true,
    ref: 'Station'
  },
  _sensor: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'Sensor'
  }
});

AlertSchema.pre('save', function (next) {
  const alert = this;

  if (alert.isModified('status')) {
    alert.history.push({status: alert.status, date: moment()});
    next();
  } else {
    next();
  }
});

const Alert = mongoose.model('Alert', AlertSchema)

export default Alert;
