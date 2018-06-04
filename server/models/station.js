const mongoose = require('mongoose');

const Station = mongoose.model('Station', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  identifier: {
    type: String,
    required: true,
    unique: true
  },
  _parking: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Parking'
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

module.exports=Station;
