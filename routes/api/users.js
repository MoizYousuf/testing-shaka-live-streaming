const express = require("express");
const bcrypt = require("bcryptjs");
const mailer = require("../../misc/mailer");
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
const Nexmo = require("nexmo");
const { response } = require("express");
const otp = require("../../config/opt");
const mail = require("../../config/mail");

// Otp

router.post("/otp", async function (req, res) {
  let { to } = req.body;
  User.findOne(isNaN(Number(to)) ? { email: to } : { phone: to }).then(
    (user) => {
      if (!user) {
        return res.status(400).json({
          success: false,
          message: "There is no user according this detail",
        });
      }
      if (user) {
        res.status(200).json({
          success: true,
          messsage: `Code sent successfully on your ${
            !isNaN(Number(to)) ? "Phone Number" : "Mail"
          }`,
          otp: !isNaN(Number(to)) ? otp(Number(to)) : mail(to),
          id: user._id,
        });
      }
    }
  );
});

// // Reset Password

// router.post("/resetPassword", async function (req, res) {
//   let { too } = req.body;
//   let send = "";
//   too.map((val) => {
//     send = send + `${val} ,`;
//   });
//   // res.status(200).json({ send });
//   let isSend = await mail(send);
//   if (isSend) {
//     res.status(200).json({ message: "mail sended", to: send });
//   } else {
//     res.send("ERROR NOT SEND");
//   }
// });

router.post("/resetPassword", (req, res) => {
  let { password, id } = req.body;
  bcrypt.genSalt(10, (err, salt) => {
    console.log("==");
    bcrypt.hash(password, salt, (err, hash) => {
      User.findByIdAndUpdate(id, { password: hash }, (error, result) => {
        console.log("BHAI RESULT CHECK KAR LE ", result);
        if (!result) {
          console.log("ERROR", error);
          res.status(400).json({
            success: false,
            message: "Please Enter Your Correct Detail",
          });
        } else {
          res
            .status(200)
            .json({ success: true, message: "Password is updated" });
        }
      });
      // res.send(hash)
    });
  });
});

// Login with Google

router.post("/loginViaGoogle", function (req, res) {
  let { email, id } = req.body;
  console.log(req.body);
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(202).json({ success: false });
    }
    if (user) {
      let token = generateAccessToken({
        email: user.email,
        password: user.password,
        _id: user._id,
        type: user.type,
      });
      return res.status(200).json({ success: true, token, user });
    }
  });
});

// LOGIN WITH FACEBOOK

router.post("/loginViaFacebook", function (req, res) {
  let { email, id } = req.body;
  console.log(req.body);
  User.findOne({ email }).then((user) => {
    if (!user) {
      return res.status(202).json({ success: false });
    }
    if (user) {
      let token = generateAccessToken({
        email: user.email,
        password: user.password,
        _id: user._id,
        type: user.type,
      });

      return res.status(200).json({ success: true, token, user });
    }
  });
});

// GET ALL USER ONLY ADMIN CAN ACCESS

router.get("/getAll", authenticateAdminToken, (req, res) => {
  User.find().then((user) => {
    if (!user) {
      res.status(202).json({ success: false, message: "Users not found" });
    } else {
      res
        .status(200)
        .json({ success: true, message: "Get All Success", users: user });
    }
  });
});

// IN THIS API USER CAN GET THE DATA FROM THE HIS/HER OWN ID

router.get("/getUserById/:id", authenticateToken, (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((user) => {
      if (!user) {
        res.status(202).json({ success: false, message: "User not found" });
      } else {
        res
          .status(200)
          .json({ success: true, message: "Get User By Success", user: user });
      }
    })
    .catch((err) => {
      res.status(202).json({ success: false, message: err });
    });
});

// HERE WE CAN FILTER USERS ONLY ADMIN CAN ACCESS

router.get("/getUserByQuery", authenticateAdminToken, async (req, res) => {
  let parsedUrl = url.parse(req.url);
  let query = querystring.parse(parsedUrl.query);
  let keys = Object.keys(query);
  let values = Object.values(query);
  let queryObject = {};
  keys.map((val, index) => {
    queryObject[val] = values[index];
  });
  User.find(queryObject, {
    _id: 1,
    userName: 1,
    firstName: 1,
    lastName: 1,
    picture: 1,
    email: 1,
    status: 1,
    emailVerified: 1,
    date: 1,
    type: 1,
  })
    .then((user) => {
      if (!user) {
        res.status(202).json({ success: false, message: "Users not found!" });
      } else {
        if (user.length > 0) {
          res
            .status(200)
            .json({ success: true, message: "Get User Success", users: user });
        } else {
          res.status(202).json({
            success: true,
            message: "I think You Enter The Wrong Query",
            users: user,
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(202).json({ success: false, message: "Users not found" });
    });
});

router.post("/login", async function (req, res) {
  let { email, phone, password } = req.body;
  let token;
  User.findOne(email ? { email } : { phone }).then((user) => {
    if (!user) {
      return res
        .status(202)
        .json({ success: false, message: "User Does not Found" });
    }
    if (user) {
      token = generateAccessToken(
        email
          ? {
              email: user.email,
              password: user.password,
              _id: user._id,
              type: user.type,
              subType: user.subType,
            }
          : {
              phone: user.phone,
              password: user.password,
              _id: user._id,
              type: user.type,
              subType: user.subType,
            }
      );
      bcrypt.compare(password, user.password).then((isMatch) => {
        // If the password matches isMatch will be true.

        if (isMatch) {
          // User found

          // Get current time stamp and save it as last login time
          const userField = {};
          userField.lastLoginDateAndTime = Math.round(
            new Date().getTime() / 1000
          );
          let go = email ? { email } : { phone };
          // Save the last login data and time for this user.
          User.findOneAndUpdate(go, { $set: userField }, { new: true })
            .then((user) => {
              return res.status(200).json({ success: true, token, user });
            })
            .catch((errors) => res.json(errors));
        } else {
          // If the password does not match
          return res
            .status(202)
            .json({ success: false, message: "password Incorrect" });
        }
      });
    }
  });
});
// SignUp

// USER UPDATE ------------- UPDATE PUT API -----------------

router.put("/", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  User.findOneAndUpdate({ _id: user._id }, req.body, (err, result) => {
    if (!err) {
      res.status(200).json({
        success: true,
        message: "User Update Succesfully",
        user: result,
        whatIsNew: req.body
      });
    } else {
      res
        .status(203)
        .json({ success: false, message: "User Not Updated", error: err });
    }
  });
});

router.post("/signUp", function (req, res) {
  let { email, googleUserId, phone, type } = req.body;

  User.findOne({ email }).then((user) => {
    console.log(user);
    if (user) {
      return res
        .status(202)
        .json({ success: false, message: "User Already Registered." });
    }
    if (!user) {
      User.findOne({ phone }).then((user) => {
        if (user) {
          return res.status(202).json({
            success: false,
            message: "Phone Number is already Registered.",
          });
        }
        if (!user) console.log(user);
        const newUser = new User({
          userName: req.body.userName || "",
          registrationType: req.body.registrationType || "",
          picture: req.body.picture ? req.body.picture : "",
          facebookUserId: req.body.facebookUserId
            ? req.body.facebookUserId
            : "",
          googleUserId: req.body.googleUserId ? req.body.googleUserId : "",
          email: req.body.email ? req.body.email : "",
          country: req.body.country || "",
          phone: req.body.phone || "",
          month: req.body.month || "",
          year: req.body.year || "",
          day: req.body.day || "",
          password: req.body.password,
          type: type,
          role: req.body.role || "",
          subType: req.body.subType || "",
          emailVerified: true,
          status: "active",
          notificationIds: [],
          deletedNotificationsIds: [],
          readNotificationIds: [],
          // userComingFromUrl: req.headers.referer,
          secretToken: "",
          lastLoginDateAndTime: "",
        });

        bcrypt.genSalt(10, (err, salt) => {
          console.log("==");
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            console.log("===");

            // If there is an error throw the error, otherwise set the newUser.password equal to hash created from bcrypt.hash()
            if (err) throw err;
            newUser.password = hash;

            // Then save user in the database using newUser.save() and then send the user as response on success and error on failure.
            newUser.save().then((user) => {
              let token = generateAccessToken(
                email
                  ? {
                      email: user.email,
                      password: user.password,
                      _id: user._id,
                      type: user.type,
                      subType: user.subType,
                    }
                  : {
                      phone: user.phone,
                      password: user.password,
                      _id: user._id,
                      type: user.type,
                      subType: user.subType,
                    }
              );
              return res.status(200).json({
                success: true,
                token,
                user,
                otp: phone ? otp(Number(phone)) : mail(email),
                message: "User Registered Successfully.",
              });
            });
          });
        });
      });
    }
  });
});

module.exports = router;
