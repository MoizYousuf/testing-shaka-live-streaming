const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubscriptionSchema = new Schema({
  user: {
    type: String,
    ref: "users",
  },
  subscription: {
    type: String,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Number,
  },
  paymentId: {
    type: String,
  },
});

module.exports = Payment = mongoose.model("subscription", SubscriptionSchema);
