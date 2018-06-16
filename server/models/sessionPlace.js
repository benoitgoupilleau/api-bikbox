const mongoose = require('mongoose');
const pick = require('lodash.pick');

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

SessionPlaceSchema.methods.toJSON = function () {
  const sessionPlace = this;
  const sessionPlaceObject = sessionPlace.toObject();

  return pick(sessionPlaceObject, ['_id', 'identifier', 'startDate', 'endDate'])
};

SessionPlaceSchema.index({ identifier: 1, startDate: 1 }, { unique: true })

const SessionPlace = mongoose.model('SessionPlace', SessionPlaceSchema)

module.exports=SessionPlace;
