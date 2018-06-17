const mongoose = require('mongoose');

const SessionBike = mongoose.model('SessionBike', {
  _bike: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Bike'
  },
  _entity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Entity'
  },
  startDate: {
    type: Number,
    required: true
  },
  endDate: {
    type: Number,
    required: true,
    default: null
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  createdAt: Number,
  lastUpdatedDate: Number
});

module.exports=SessionBike;
