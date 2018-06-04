const mongoose = require('mongoose');

const SessionPlace = mongoose.model('SessionPlace', {
  _sensor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Sensor'
  },
  startDate: {
    type: Number,
    required: true
  },
  endDate: {
    type: Number,
    required: true
  },
  createdAt: Number,
  lastUpdatedDate: Number
});

module.exports=SessionPlace;
