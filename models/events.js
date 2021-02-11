const mongoose = require("mongoose");
const User = require("./User");
const Schema = mongoose.Schema;

/**
 * Create Schema
 * Create a new instance of User model and set the values of the properties(fields)
 */
const EventSchema = new Schema({
  eventTitle: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  tags: {
    type: Array,
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
  shakas: {
    type: Array,
  },
  watchings: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
  },
  userId: {
    type: String,
    ref: "users",
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
  assetId: {
    type: String,
    default: "",
  },
  age: {
    type: Number,
    default: 0,
  },
  sport: {
    type: String,
    default: "",
  },
  isStream: {
    type: Boolean,
    default: false,
  },
  saved: {
    type: Array,
    default: [],
  },
  status: {
    type: Boolean,
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
