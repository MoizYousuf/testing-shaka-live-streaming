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
const Payment = require("../../models/Payments");
const { default: axios } = require("axios");
const Event = require("../../models/events");
const stripe = Stripe(
  "sk_test_51IOrKRCPWFz5S2kttcPONcaxqmqlXUzqP1o04NIvVaYXKhLuFqPg3b2plvOtU0hOPO3BbCK4s5T524dOKbXU0Orj00TRPwXEXe"
);
// Otp

router.post("/", authenticateToken, async function (req, res) {
  let { amount, token, id, acountStripeId } = req.body;
  let user = await getDetail(req, res);
  const charge = await stripe.charges.create({
    amount: amount,
    currency: "usd",
    source: token,
    description: "My First Test Charge (created for API docs)",
  });
  if (charge) {
    const transfer = await stripe.transfers.create({
      amount: 80,
      currency: "usd",
      source_transaction: charge.id,
      destination: acountStripeId,
    });
    if (transfer) {
      Event.findByIdAndUpdate(id, {
        $push: { paids: user._id },
      }).then((data) => {
        const newPayment = new Payment({
          event: id,
          senderPaymentUser: user._id,
          user: data.userId,
          status: true,
          paidAmount: 0.8,
        });

        newPayment
          .save()
          .then((payment) => {
            res.status(200).json({
              success: true,
              message: "Payment Success",
            });
          })
          .catch((err) => {
            return res
              .status(200)
              .json({ success: false, message: "Payment Not Added" });
          });
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Stripe Error",
      });
    }
  } else {
    res.status(400).json({ status: false, messsage: "There is no customer" });
  }
});
router.post("/createCustomer", authenticateToken, async (req, res, next) => {
  let user = await getDetail(req, res, next);
  const account = await stripe.account.create({
    // description: "Shaka User Broadcaster",
    email: user.email,
    // balance: 2000,
    country: "US",
    type: "custom",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    phone: user.phone,
  });
  User.findByIdAndUpdate(user._id, {
    acountStripeId: account.id,
  })
    .then((data) => {
      res.status(200).json({
        success: true,
        messsage: "stripe account created",
        data: { acountStripeId: account.id },
      });
    })
    .catch((err) => {
      res.status(400).json({
        success: false,
        message: "User not updated stripe account created",
      });
    });
});
router.get("/isVerified/:id", authenticateToken, async (req, res, next) => {
  // let user = await getDetail(req, res, next);
  const account = await stripe.accounts.retrieve(req.params.id);
  if (account) {
    console.log(account);
    let { capabilities } = account;
    if (capabilities) {
      let { card_payments, transfers } = capabilities;

      if (card_payments == "inactive") {
        res
          .status(200)
          .json({ success: false, message: "Your account is not Verified!" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Your account is Verified!" });
      }
    }
  } else {
    res.status(400).json({ success: false, messsage: "acccount is not found" });
  }
});
router.get(
  "/getAccountDetail/:id",
  authenticateToken,
  async (req, res, next) => {
    const account = await stripe.balance.retrieve({
      stripeAccount: req.params.id,
    });
    if (account) {
      res.status(200).json({
        success: true,
        message: "Account Detail Got!!",
        data: account,
      });
    } else {
      res
        .status(400)
        .json({ success: false, messsage: "acccount is not found" });
    }
  }
);

router.post("/createLink/:id", authenticateToken, async (req, res, next) => {
  let user = await getDetail(req, res, next);
  const accountLink = await stripe.accountLinks.create({
    account: req.params.id,
    refresh_url:
      "https://morofy-database.herokuapp.com/api/payments/redirectToApp/failed",
    return_url:
      "https://morofy-database.herokuapp.com/api/payments/redirectToApp/updated",
    type: "account_onboarding",
  });

  res.status(200).json({
    status: true,
    messsage: "stripe account created",
    data: accountLink,
  });
});
router.get("/redirectToApp/:id", async (req, res, next) => {
  res.redirect(`shakaapp://${req.params.id}`);
});
router.get("/getAllMyPayments", authenticateToken, async (req, res, next) => {
  let user = await getDetail(req, res, next);
  Payment.find({ user: user._id })
    .populate("senderPaymentUser")
    .populate("event")
    .then((data) => {
      if (data && data.length > 0) {
        res.status(200).json({
          success: true,
          messsage: "Got Payment Details",
          data,
        });
      } else {
        res.status(201).json({
          success: false,
          messsage: "There is no payments history",
        });
      }
    });
});
router.put("/linkWithMyAccount/:id", authenticateToken, async (req, res) => {
  try {
    const card = await stripe.accounts.createExternalAccount(req.params.id, {
      external_account: req.body.token,
    });
    console.log("HERE IS ERROR LETS IDENTIFY");
    res.status(200).json({
      success: true,
      message: "stripe card created",
      data: card,
    });
  } catch (error) {
    res.status(201).json({
      success: false,
      message: error.message,
    });
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
