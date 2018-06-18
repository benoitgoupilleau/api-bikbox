const mongoose = require('mongoose');

const Parking = mongoose.model('Parking', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
    trim: true
  },
  description: String,
  address: String,
  nbSpot: {
    type: Number,
    default: 0
  },
  _entity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Entity'
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

module.exports=Parking;
