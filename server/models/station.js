import mongoose from 'mongoose';

const Station = mongoose.model('Station', {
  name: String,
  identifier: {
    type: String,
    required: true
  },
  _parking: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Parking'
  },
  firmwareVersion: String,
  lastChangedBattery: {
    type: Number,
    default: null
  },
  voltage: {
    type: Number,
    default: null
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  }
});

export default Station;
