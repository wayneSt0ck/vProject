const mongoose = require('mongoose');

const historySchema = mongoose.Schema({
  title: { type: String, required: true },
  dayStart: {type: String, required: true},
  dayEnd: {type: String, required: true},
  dayEntered: {type: String, required: true},
  harvestAmount: {type: String, required: true},
  errorstream: {type: Array, required: false},
  tempstream: {type: Array, required: false},
  moisturestream: {type: Array, required: false},
  foodstream: {type: Array, required: false},
  foodamountstream: {type: Array, required: false},
  timestream: {type: Array, required: false}
}, {
  collection: 'binHistory'
});

module.exports = mongoose.model('History', historySchema);
