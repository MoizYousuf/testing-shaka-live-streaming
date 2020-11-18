const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Create Schema
 * Create a new instance of User model and set the values of the properties(fields)
 */

//  USER SCHEMA IS THERE HERE THIS IS ALL USER HAVE MAYBE THIS IS ENOUGH DATA

const UserSchema = new Schema({
  userName: {
    type: String,
  },
  email: {
    type: String,
    // required: true
  },
  password: {
    type: String,
    required: true,
  },
  facebookUserId: {
    type: String,
  },
  googleUserId: {
    type: String,
  },
  registrationType: {
    type: String,
  },
  picture: {
    type: String,
  },
  phone: {
    type: String,
  },

  country: {
    type: String,
  },
  referral: {
    type: String,
  },
  userComingFromUrl: {
    type: String,
  },
  type: {
    type: String,
  },
  day: {
    type: String,
  },
  month: {
    type: String,
  },
  year: {
    type: String,
  },
  subType: {
    type: String,
  },
  emailVerified: {
    type: Boolean,
  },
  emailVerificationExpiry: {
    type: String,
  },
  status: {
    type: String,
  },
  secretToken: {
    type: String,
  },
  passwordResetToken: {
    type: String,
  },
  lastLoginDateAndTime: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
module.exports = User = mongoose.model("users", UserSchema);
