const mongoose = require('mongoose');

const SessionPlaceSchema = new mongoose.Schema({
  identifier: {
    type: String,
    required: true,
    ref: 'Sensor'
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
    type: Number
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  createdAt: Number,
  lastUpdatedDate: Number,
  deleteDate: Number
});

SessionPlaceSchema.index({ identifier: 1, startDate: 1 }, { unique: true })

const SessionPlace = mongoose.model('SessionPlace', SessionPlaceSchema)

module.exports=SessionPlace;
