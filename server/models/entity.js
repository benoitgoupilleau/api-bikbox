const mongoose = require('mongoose');

const Entity = mongoose.model('Entity', {
  name: {
    type: String,
    required: true,
    minlength: 1,
    unique: true,
    trim: true
  },
  description: String,
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  createdAt: Number,
  deleteDate: Number,
  lastUpdatedDate: Number
});

module.exports=Entity;
