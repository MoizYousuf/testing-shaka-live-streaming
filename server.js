const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("./mongoose/mongoose");
var cors = require("cors");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const morgan = require("morgan");
require("dotenv").config();
// App instance : Set app equal to the object returned by express();

/**
 * Configure the middleware.
 * bodyParser.json() returns a function that is passed as a param to app.use() as middleware
 * With the help of this method, we can now send JSON to our express application.
 */
let watchingsData = [];
let shakas = [];
io.on("connection", function (socket) {
  console.log("USer Connectd");
  socket.on("watchings", (msg) => {
    watchingsData.push(msg);
    console.log("STARTING", watchingsData);
    io.emit("watchings", watchingsData);
    // io.emit("chat message", msg);
  });
  socket.on("endWatchings", (msg) => {
    watchingsData.push(msg);
    console.log("ENDING", watchingsData);
    io.emit("watchings", watchingsData);
    // io.emit("chat message", msg);
  });

  socket.on("shakas", (msg) => {
    console.log("WOW", msg);
    shakas.push(msg);
    io.emit("shakas", shakas);
  });

  socket.on("disconnect", function () {
    console.log("Got disconnect!");
  });
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static("uploads"));
// app.use(express.static(__dirname, "uploads "));
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);
  // Pass to next layer of middleware
  next();
  //   throw new Error("BROKEN");
});

// Using Body Parser to pass data as we want
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// There is our Routes

const users = require("./routes/api/users");
app.use("/api/users", users);

const packages = require("./routes/api/packages");
app.use("/api/packages", packages);

const events = require("./routes/api/events");
app.use("/api/events", events);

const payments = require("./routes/api/payments");
app.use("/api/payments", payments);
app.use("/api/mydetails", (req, res, next) => {
  res.status(200).json({
    success: true,
    message: "details gots",
    data: {
      name: "Asher",
      phoneNumber: "03172874198",
      gender: "male",
      fatherName: "Sheikh",
      address: "bengali colony near kachra kundii before ghutturr :) :-)  !",
    },
  });
});
const subscriptions = require("./routes/api/subscriptions");
app.use("/api/subscriptions", subscriptions);

const image = require("./routes/api/imageUpload");
app.use("/api/image", image);

// Set up a port
const port = process.env.PORT || 5000;

http.listen(port, () => console.log(`Server running on port: ${port}`));
