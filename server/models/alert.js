const mongoose = require('mongoose');

const Alert = mongoose.model('Alert', {
  name: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String,
    required: true
  },
  createdAt: {
    type: Number,
    required: true
  },
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

module.exports = { Alert };
