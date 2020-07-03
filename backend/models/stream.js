const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  binname: {type: String, required: true},
  tempstream: { type: Array, required: true },
  moisturestream: {type: Array, required: true},
  foodstream: {type: Array, required: false},
  foodamountstream: {type: Array, required: false},
  timestream: {type: Array, required: true},
});

module.exports = mongoose.model('DataStream', postSchema);
