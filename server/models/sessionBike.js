const mongoose = require('mongoose');

const SessionBikeSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    ref: 'Bike'
  },
  _entity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Entity'
  },
  _parking: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Parking'
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

SessionBikeSchema.index({ identifier: 1, startDate: 1 }, { unique: true });

const SessionBike = mongoose.model('SessionBike', SessionBikeSchema);

module.exports=SessionBike;
