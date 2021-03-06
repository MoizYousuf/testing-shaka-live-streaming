const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PaymentSchema = new Schema({
  event: {
    type: String,
    ref: "events",
  },
  user: {
    type: String,
    ref: "users",
  },
  senderPaymentUser: {
    type: String,
    ref: "users",
  },
  paidAmount: {
    type: Number,
  },
  status: {
    type: Boolean,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Payment = mongoose.model("payments", PaymentSchema);
