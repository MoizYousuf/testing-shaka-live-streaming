const express = require("express");
const bcrypt = require("bcryptjs");
// Load user model.
const User = require("../../models/User");
const url = require("url");
const querystring = require("querystring");
const {
  authenticateAdminToken,
  authenticateToken,
  getDetail,
} = require("../../config/jwtToken");
const router = express.Router();
const { generateAccessToken } = require("../../config/jwtToken");
const otp = require("../../config/opt");
const mail = require("../../config/mail");
const Stripe = require("stripe");
const Subscription = require("../../models/Subscription");
const { default: axios } = require("axios");
const Event = require("../../models/events");
const stripe = Stripe(
  process.env.DEVELOPMENT
    ? process.env.STRIPE_KEY_TEST
    : process.env.STRIPE_KEY_LIVE
);

// Create Subscriptions

router.post("/", authenticateToken, async function (req, res) {
  let { amount, token } = req.body;
  let user = await getDetail(req, res);
  var myCurrentDate = new Date();
  var myFutureDate = new Date(myCurrentDate);
  myFutureDate.setDate(myFutureDate.getDate() + 7);
  // console.log("DAMAN CHURAA TO NA LOGEE!!", myFutureDate.valueOf());

  const charge = await stripe.charges.create({
    amount: amount,
    currency: "usd",
    source: token,
    description: "My First Test Charge (created for API docs)",
  });
  if (charge) {
    const newSubscription = new Subscription({
      user: user._id,
      subscription: "weekly",
      endDate: myFutureDate.valueOf(),
      paymentId: req.body.paymentId,
    });

    newSubscription
      .save()
      .then((subscription) => {
        res.status(200).json({
          success: true,
          message: "Subscription Success",
          data: subscription,
        });
      })
      .catch((err) => {
        return res
          .status(200)
          .json({ success: false, message: "Your Subscription Declined" });
      });
  } else {
    res
      .status(400)
      .json({ status: false, messsage: "Your Subscription Declined" });
  }
});
router.get("/", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);

  Subscription.find({ user: user._id })
    .then((subscription) => {
      res.status(200).json({
        success: true,
        message: "Got Your All Subscrition",
        data: subscription,
      });
    })
    .catch((err) => {
      return res
        .status(200)
        .json({ success: false, message: "There is no Subscriptions" });
    });
});
router.get(
  "/checkCurrentSubscription",
  authenticateToken,
  async function (req, res) {
    let user = await getDetail(req, res);
    // console.log("CHECKING", Date.now());
    Subscription.find({
      user: user._id,
      endDate: {
        $gt: Date.now(),
      },
    })
      .then((subscription) => {
        res.status(200).json({
          success: true,
          message: "Got Your All Subscrition",
          data: subscription,
        });
      })
      .catch((err) => {
        console.log("BROTHER ERROR IS HERE ", err);
        return res
          .status(200)
          .json({ success: false, message: "There is no Subscriptions" });
      });
  }
);

module.exports = router;
