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
const Event = require("../../models/events");
const stripe = Stripe(
  "sk_test_51IOrKRCPWFz5S2kttcPONcaxqmqlXUzqP1o04NIvVaYXKhLuFqPg3b2plvOtU0hOPO3BbCK4s5T524dOKbXU0Orj00TRPwXEXe"
);
// Otp

router.post("/", authenticateToken, async function (req, res) {
  let { amount, token, id } = req.body;
  let user = await getDetail(req, res);
  const charge = await stripe.charges.create({
    amount: amount,
    currency: "usd",
    source: token,
    description: "My First Test Charge (created for API docs)",
  });
  if (charge) {
    Event.findByIdAndUpdate(id, {
      $push: { paids: user._id },
    }).then((data) => {
      console.log("UPDATE DATA", data);
      res.status(200).json({
        success: true,
        message: "Payment Success",
      });
    });

    // User.findOneAndUpdate(
    //   { _id: user._id },
    //   { subscription: true, subscriptionStartDate: new Date() },
    //   (err, result) => {
    //     if (!err) {
    //       res.status(200).json({
    //         success: true,
    //         message: "Payment Success",
    //         user: result,
    //         whatIsNew: {
    //           subscription: true,
    //           subscriptionStartDate: new Date(),
    //         },
    //       });
    //     } else {
    //       res
    //         .status(203)
    //         .json({ success: false, message: "User Not Updated", error: err });
    //     }
    //   }
    // );
  } else {
    res.status(400).json({ success: false, message: "Payment UnSuccess" });
  }
});
router.post("/createCustomer", authenticateToken, async (req, res, next) => {
  let user = await getDetail(req, res, next);
  const customer = await stripe.customers.create({
    description: "Shaka User Broadcaster",
    email: user.email,
    balance: 2000,
    phone: user.phone,
  });
  User.findByIdAndUpdate(user._id, {
    customerId: customer.id,
  })
    .then((data) => {
      res
        .status(200)
        .json({
          status: true,
          messsage: "customer created",
          data: { customerId: customer.id },
        });
    })
    .catch((err) => {
      res
        .status(400)
        .json({ status: false, message: "User not updated customer created" });
    });
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
          "Content-Type": "application/json",
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
