const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const mongoose = require("./mongoose/mongoose");
var cors = require("cors");
// App instance : Set app equal to the object returned by express();
const app = express();

/**
 * Configure the middleware.
 * bodyParser.json() returns a function that is passed as a param to app.use() as middleware
 * With the help of this method, we can now send JSON to our express application.
 */

app.use(cors());

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

// I am Checking Internet that our server is live or not!

app.get("/", function (req, res, next) {
  setTimeout(function () {
    try {
      throw new Error("BROKEN");
    } catch (err) {
      next(err);
    }
  }, 100);
});

// Set up a port
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port: ${port}`)); 
