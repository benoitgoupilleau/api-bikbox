const mongoose = require('mongoose');

const Sensor = mongoose.model('Sensor', {
  identifier: {
    type: String,
    required: true
  },
  _station: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Station'
  },
  firmwareVersion: String,
  lastChangedBattery: {
    type: Number,
    default: null
  },
  voltage: {
    type: String,
    default: null
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  createdAt: Number,
  deleteDate: Number,
  lastUpdatedDate: Number
});

module.exports=Sensor;
