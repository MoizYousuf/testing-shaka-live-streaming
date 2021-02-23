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
const { default: axios } = require("axios");
const stripe = Stripe(
  "sk_test_51IJConKYVzoTbC7G3Vp6sszwqqRYu4U7X8NSeHGteL9nLbxKpG1ZPXAzU8duTsy9zgIqZ2lsuDQRf3SoqPgatRba00efbkGU4o"
);
// Otp

router.post("/", authenticateToken, async function (req, res) {
  let { amount, token } = req.body;
  let user = await getDetail(req, res);
  const charge = await stripe.charges.create({
    amount: amount,
    currency: "usd",
    source: token,
    description: "My First Test Charge (created for API docs)",
  });
  if (charge) {
    User.findOneAndUpdate(
      { _id: user._id },
      { subscription: true, subscriptionStartDate: new Date() },
      (err, result) => {
        if (!err) {
          res.status(200).json({
            success: true,
            message: "Payment Success",
            user: result,
            whatIsNew: {
              subscription: true,
              subscriptionStartDate: new Date(),
            },
          });
        } else {
          res
            .status(203)
            .json({ success: false, message: "User Not Updated", error: err });
        }
      }
    );
  } else {
    res.status(400).json({ success: false, message: "Payment UnSuccess" });
  }
});

router.post("/muvi/addCard", async (req, res) => {
  axios
    .post(
      "https://cms.muvi.com/rest/RegisterUserV1",
      {
        name: "Moiz",
        email: "moiz@gmail.com",
        password: "125521",
      },
      {
        headers: {
          Authorization: `bearer af8b13663261c0784ad55dcb414ffe66`,
          'Content-Type': 'application/json',
        },
      }
    )
    .then((response) => {
      res.status(200).json({
        success: true,
        messsage: "user created",
        resposne: response.data,
      });
    })
    .catch((err) => {
      console.log("EROOR IS THERe", err);
      res.status(400).json({
        success: false,
        messsage: "error exist",
      });
    });
});

module.exports = router;
