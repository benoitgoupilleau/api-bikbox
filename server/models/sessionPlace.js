const mongoose = require('mongoose');

const SessionPlaceSchema = new mongoose.Schema({
  _sensor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Sensor'
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
    type: Number
  },
  createdAt: Number,
  lastUpdatedDate: Number
});

SessionPlaceSchema.index({ _sensor: 1, startDate: 1 }, { unique: true })

const SessionPlace = mongoose.model('SessionPlace', SessionPlaceSchema)

module.exports=SessionPlace;
