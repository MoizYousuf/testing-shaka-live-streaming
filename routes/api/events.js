const Mux = require("@mux/mux-node");
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

const { Video } = new Mux(
  "983baf3d-90a1-4e70-91c4-3f1bdc59e494",
  "2VYEZMgylLCTKfjUkgav41ptS1MkkthrxBbrDMCkoQB7GYhNswYzVOG3Ncov//mqua2bkP55fm6"
);

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
router.get("/save", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.find()
    .populate("userId")
    .then(async (event) => {
      let events = [];
      await event.map(async (val, index) => {
        if (val.saved && val.saved.length > 0) {
          let is = false;
          await val.saved.map((value, i) => {
            if (value == user._id) {
              is = true;
            }
          });
          if (is) {
            events.push(val);
          }
        }
      });
      return res.status(200).json({
        success: true,
        data: events,
        message: "Got All Yours Saved Videos Successfully",
      });
    })
    .catch((err) => console.log("DONE ERRO", err));
});
router.get("/myevents", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.find({ userId: user._id, isStream: false })
    .then((event) => {
      return res.status(200).json({
        success: true,
        data: event,
        message: "Got All Events Successfully",
      });
    })
    .catch((err) => console.log("DONE ERRO", err));
});
router.get("/myvideos", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.find({ userId: user._id, isStream: true })
    .populate("userId")
    .then((event) => {
      return res.status(200).json({
        success: true,
        data: event,
        message: "Got All Your Videos Successfully",
      });
    })
    .catch((err) => console.log("DONE ERRO", err));
});
router.delete("/myvideos/:id", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.findOneAndDelete({
    userId: user._id,
    _id: req.params.id,
    isStream: true,
  })
    .then((event) => {
      return res.status(200).json({
        success: true,
        message: "Your Video Delete Successfully",
      });
    })
    .catch((err) =>
      res.status(400).json({
        success: false,
        message: "Your Video Not Found or Not Deleted",
      })
    );
});
router.get("/myevents/:id", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.findById(req.params.id)
    .populate("userId")
    .then((event) => {
      console.log("Status", event);
      return res.status(200).json({
        success: true,
        data: event,
        message: "Got Event By Id Successfully",
      });
    })
    .catch((err) => {
      console.log("error", err);
      res.status("500").json({
        success: false,
        message: "Please Make Sure Your Id is correct",
      });
    });
});

router.delete("/save/:id", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.findOne({
    _id: req.params.id,
  })
    .then((item) => {
      if (item) {
        Events.findOneAndUpdate(
          {
            _id: req.params.id,
          },
          { saved: item.saved.filter((val) => val !== user._id) }
        )
          .then((event) => {
            return res.status(200).json({
              success: true,
              data: event,
              message: "Update Successfully",
            });
          })
          .catch((err) =>
            res
              .status(500)
              .json({ success: false, message: "Can`t update this events" })
          );
      } else {
        res.status(500).json({ success: false, message: "Event Not Found" });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ success: false, message: "Can`t update this events" })
    );
});
router.put("/save/:id", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.findById(req.params.id)
    .then((item) => {
      if (item) {
        Events.findOneAndUpdate(
          {
            _id: req.params.id,
          },
          { saved: [...item.saved, user._id] }
        )
          .then((event) => {
            return res.status(200).json({
              success: true,
              data: event,
              message: "Update Successfully",
            });
          })
          .catch((err) =>
            res
              .status(500)
              .json({ success: false, message: "Can`t update this events" })
          );
      } else {
        res.status(500).json({ success: false, message: "Event Not Found" });
      }
    })
    .catch((err) =>
      res
        .status(500)
        .json({ success: false, message: "Can`t update this events" })
    );
});
router.put("/updateEvent/:id", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: user._id,
      data: Date.now,
    },
    {
      ...req.body,
    }
  )
    .then((event) => {
      return res.status(200).json({
        success: true,
        data: event,
        whatIsNew: req.body,
        message: "Update Successfully",
      });
    })
    .catch((err) =>
      res.status(200).json({
        success: false,
        message: "Event Not Found",
      })
    );
});
router.put("/:id", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: user._id,
      data: Date.now,
    },
    {
      status: req.body.stream == 1,
      isStream: req.body.stream !== 1,
      assetId: req.body.assetId,
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
router.delete("/:id", authenticateToken, async function (req, res) {
  let user = await getDetail(req, res);
  Events.findById(req.params.id)
    .then((event) => {
      if (event && event.userId == user._id) {
        Events.findByIdAndDelete(req.params.id)
          .then((event) => {
            return res.status(200).json({
              success: true,
              message: "Delete Successfully",
            });
          })
          .catch((err) => {
            res.status(500).json({
              success: false,
              message: "Event Not Deleted",
            });
          });
      } else {
        res.status(500).json({
          success: false,
          message: "You are not able to delete this event",
        });
      }
    })
    .catch((err) => {
      console.log("error", err);
      res.status(500).json({
        success: false,
        message: "You are not able to delete this event",
      });
    });
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
router.get("/watchings/:id", authenticateToken, async function (req, res) {
  // let user = await getDetail(req, res);
  Events.findById(req.params.id)
    .then((event) => {
      if (event && event !== null) {
        res.status(200).json({
          success: true,
          data: { watchings: event.watchings },
          message: "Watchings Gotted",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Events Not found maybe you sent wrong id",
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

// SEARCH API IMPLEMENTATION FULLY CUSTOM BY ME!!

router.get("/search", authenticateToken, function (req, res) {
  let query = req.query;
  console.log("WOW THIS IS NICE!!", query);
  Events.find({ status: true })
    .populate("userId")
    .then(async (event) => {
      let dataWhenItsFilteredFully = await event.filter((val) =>
        val.eventTitle.includes(req.query.eventTitle)
      );

      return res.status(200).json({
        success: true,
        data: dataWhenItsFilteredFully,
        message: "Got All Events Successfully",
      });
    })
    .catch((err) => console.log("DONE ERRO", err));
});
router.get("/videoUpload", function (req, res) {
  Video.Uploads.create({
    cors_origin: "https://api.mux.com/video/v1/uploads",
    new_asset_settings: {
      playback_policy: "public",
    },
  })
    .then((upload) => {
      console.log("I GOT THE DATA", upload);
      return res.status(200).json({
        ...upload,
        success: true,
        url: upload.url,
        message: "Uploaded",
      });
    })
    .catch((err) => {
      console.log("HERE IS ERROR", err);
    });
});
// router.get("/videoUpload", function (req, res) {
//   return res.status(200).json({
//     success: true,
//     message: "Uploaded",
//   });
// });

module.exports = router;
