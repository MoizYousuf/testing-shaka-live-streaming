const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Create Schema
 * Create a new instance of User model and set the values of the properties(fields)
 */
const EventSchema = new Schema({
  eventTitle: {
    type: String,
  },
  tags: {
    type: String,
  },
  locations: {
    type: String,
  },
  quality: {
    type: String,
  },
  link: {
    type: String,
  },
  description: {
    type: String,
  },
  userId: {
    type: String,
  },
  startAge: {
    type: Number,
  },
  endAge: {
    type: Number,
  },
  streamId: {
    type: String,
  },
  playbackId: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Create a mongoose collection model for a collection name 'users', so that mongoose knows how to store data.
 * model() is used to create a new model, which takes the following args
 * first arg 'user', is the name of the collection
 * We pass the second property as model EventSchema created above,
 * which contains the properties/attributes that the 'user' collection will have.
 */
module.exports = Package = mongoose.model("events", EventSchema);
