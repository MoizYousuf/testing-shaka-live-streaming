const multer = require("multer");
const express = require("express");
const router = express.Router();
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post("/", upload.single("photo"), async function (req, res) {
  console.log("JUST CHECKING", req.file);
  if (req && req.file) {
    res.status(200).json({
      originalname: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      size: req.file.size,
      ...req.file,
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
