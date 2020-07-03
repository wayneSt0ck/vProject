const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  status: {type: String, required: true},
  temp: {type: String, required: true},
  moisture: {type: String, required: true},
  timestamp: {type: String, required: true},
  daysleft: {type: String, required: true},
  dayStart: {type: String, required: false},
  dayEnd: {type: String, required: false},
  errorstream: {type: Array, required: false},
  tempstream: {type: Array, required: false},
  moisturestream: {type: Array, required: false},
  foodstream: {type: Array, required: false},
  foodamountstream: {type: Array, required: false},
  timestream: {type: Array, required: false}
});

module.exports = mongoose.model('Post', postSchema);
