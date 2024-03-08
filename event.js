
const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
    caption: String,
    imageUrl: String
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;