const multer = require("multer");
const upload = multer({ dest: __dirname + "/uploads/images" });
const express = require("express");
const router = express.Router();

router.post("/", upload.single("photo"), async function (req, res) {
  if (req.file) {
    res.status(200).json({
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      success: true,
      message: "image upload successfully",
    });
  } else {
    res
      .status(400)
      .json({ success: false, message: "There is no image to upload" });
  }
});
module.exports = router;
