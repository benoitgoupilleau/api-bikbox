const mongoose = require('mongoose');

const Bike = mongoose.model('Bike', {
  identifier: {
    type: String,
    required: true
  },
  _entity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Entity'
  },
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
    ref: 'User'
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  }
});

module.exports = { Bike };
