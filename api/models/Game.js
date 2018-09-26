const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  owner: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  opponent: {
    type: String
  },
  result: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: 'ready'
  },
  duration: {
    type: String,
    default: 'Not started'
  },
  lastStep: {
    type: String,
    default: 'opponent'
  },
  battlefield: mongoose.Schema.Types.Mixed
});


module.exports = mongoose.model('Game', gameSchema);