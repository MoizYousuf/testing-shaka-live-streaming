const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../../misc/mailer");
const Validator = require("schema-validator");
// Load user model.
const Events = require("../../models/events");
const url = require("url");
const querystring = require("querystring");
const { raw } = require("body-parser");
const {
  authenticateAdminToken,
  authenticateToken,
  getDetail,
} = require("../../config/jwtToken");
const { route } = require("./users");
const router = express.Router();

router.post("/", authenticateToken, function (req, res) {
  let user = getDetail(req, res);
  let keys = Object.keys(req.body);
  let data = {};
  for (let i = 0; i < keys.length; i++) {
    data[keys[i]] = req.body[keys[i]];
  }
  const newEvent = new Events({ ...data, userId: user._id, status: false });
  newEvent
    .save()
    .then((package) => {
      return res
        .status(200)
        .json({ success: true, data: package, message: "Added Successfully" });
    })
    .catch((err) => {
      console.log("SOME ERROR OCCURED", err);
      return res.status(200).json({ success: false, message: "Not Created" });
    });
});
router.get("/", authenticateToken, function (req, res) {
  Events.find({ status: true })
    .populate("userId")
    .then((event) => {
      return res.status(200).json({
        success: true,
        data: event,
        message: "Got All Events Successfully",
      });
    })
    .catch((err) => console.log("DONE ERRO", err));
});
router.get("/myevents", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.find({ userId: user._id })
    .then((event) => {
      return res.status(200).json({
        success: true,
        data: event,
        message: "Got All Events Successfully",
      });
    })
    .catch((err) => console.log("DONE ERRO", err));
});

router.put("/:id", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: user._id,
    },
    {
      status: req.body.stream == 1,
    }
  )
    .then((event) => {
      return res.status(200).json({
        success: true,
        data: { status: req.body.stream == 1 },

        message: "Update Successfully",
      });
    })
    .catch((err) => console.log("DONE ERRO", err));
});

router.post("/:id/:is", authenticateToken, async function (req, res) {
  let is = req.params.is == 0;
  let user = await getDetail(req, res);
  Events.findById(req.params.id)
    .then((event) => {
      if (event && event !== null) {
        Events.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: user._id,
          },
          {
            watchings: is
              ? event.watchings + 1
              : event.watchings == 0
              ? 0
              : event.watchings - 1,
          }
        )
          .then((event) => {
            return res.status(200).json({
              success: true,
              data: {
                watchings: is
                  ? event.watchings + 1
                  : event.watchings == 0
                  ? 0
                  : event.watchings - 1,
              },

              message: "Update Successfully",
            });
          })
          .catch((err) => console.log("DONE ERRO", err));
      } else {
        res.status(201).json({
          success: false,
          message: "Events Not found maybe you are sending wrong id",
        });
      }
    })
    .catch((err) => {
      console.log("CHEDCK ", err);
      res.status(500).json({
        success: false,
        message: "some error occured from the server",
      });
    });
});

module.exports = router;
