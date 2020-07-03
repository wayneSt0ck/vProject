const mongoose = require('mongoose');

const mqttSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
}, {
  collection: 'mqtt'
});

module.exports = mongoose.model('Mqtt', mqttSchema);
