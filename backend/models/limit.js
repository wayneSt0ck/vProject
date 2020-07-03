const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
  tempmin: { type: String, required: true },
  tempmax: {type: String, required: true},
  moisturemin: {type: String, required: true},
  moisturemax: {type: String, required: true},
});

module.exports = mongoose.model('Limit', postSchema);
