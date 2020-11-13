const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mailer = require("../../misc/mailer");
const Validator = require("schema-validator");
// Load user model.
const Package = require("../../models/Packages");
const url = require("url");
const querystring = require("querystring");
const { raw } = require("body-parser");
const {
  authenticateAdminToken,
  authenticateToken,
} = require("../../config/jwtToken");
const router = express.Router();

router.post("/", authenticateAdminToken, function (req, res) {
  console.log("WORKING")
  let keys = Object.keys(req.body);
  let data = {};
  for (let i = 0; i < keys.length; i++) {
    data[keys[i]] = req.body[keys[i]];
  }
  const newPackage = new Package(data);
  newPackage.save().then((package) => {
    return res
      .status(200)
      .json({ success: true, data: package, message: "Added Successfully" });
  });
});
router.get("/", authenticateToken, function (req, res) {
  Package.find({})
    .then((package) => {
      return res
        .status(200)
        .json({
          success: true,
          data: package,
          message: "Got All Packages Successfully",
        });
    })
    .catch((err) => console.log("DONE ERRO", err));
});

module.exports = router;
