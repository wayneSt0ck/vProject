const mongoose = require('mongoose');

const errorSchema = mongoose.Schema({
  binname: {type: String, required: true},
  errorstream: { type: Array, required: true }
});

module.exports = mongoose.model('Limit', postSchema);
