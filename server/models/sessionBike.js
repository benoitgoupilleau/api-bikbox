const mongoose = require('mongoose');

const SessionBike = mongoose.model('SessionBike', {
  _bike: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Bike'
  },
  startDate: {
    type: Number,
    required: true
  },
  endDate: {
    type: Number,
    required: true
  }
});

module.exports = { SessionBike };
