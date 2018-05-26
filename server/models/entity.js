import mongoose from 'mongoose';

const Entity = mongoose.model('Entity', {
  name: {
    type: String,
    required: true,
    minlength: 1,
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

export default Entity;
