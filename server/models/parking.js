const mongoose = require('mongoose');

const Parking = mongoose.model('Parking', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    trim: true
  },
  description: String,
  address: String,
  _entity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Entity'
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  }
});

module.exports = { Parking };
