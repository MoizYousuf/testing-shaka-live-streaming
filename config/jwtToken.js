const jwt = require("jsonwebtoken");
const secretToken =
  process.env.SECRET_TOKEN ||
  "09f26e402586e2faa8da4c98a35f1b20d6b033c6097befa8be3486a829587fe2f90a832bd3ff9d42710a4da095a2ce285b009f0c3730cd9b8e1af3eb84df6611";

module.exports.Jwt = function Jwt(token) {
  jwt.verify(token, "shhhhh", function (err, decoded) {
    console.log(decoded.foo); // bar
  });
};

module.exports.generateAccessToken = function generateAccessToken(username) {
  // expires after half and hour (1800 seconds = 30 minutes)
  console.log("TOKEN", secretToken);
  return jwt.sign(username, secretToken, { expiresIn: "1800s" });
};

module.exports.authenticateToken = function authenticateToken(req, res, next) {
  // Gather the jwt access token from the request hea der
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token

  jwt.verify(token, secretToken, (err, user) => {
    console.log(err);
    if (err)
      return res
        .status(403)
        .json({ message: "May be token expired", success: false });
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
};
module.exports.getDetail = function getDetail(req, res, next) {
  // Gather the jwt access token from the request hea der
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.sendStatus(401); // if there isn't any token

 return jwt.verify(token, secretToken, (err, user) => {
    console.log(err);
    if (err)
      return res
        .status(403)
        .json({ message: "May be token expired", success: false });
    req.user = user;
    return user; // pass the execution off to whatever request the client intended
  });
};
module.exports.authenticateAdminToken = function authenticateAdminToken(
  req,
  res,
  next
) {
  // Gather the jwt access token from the request hea der
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null)
    return res
      .sendStatus(401)
      .json({ message: "You have to must be provide us token" }); // if there isn't any token

  jwt.verify(token, secretToken, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ message: "May be token expired", success: false });
    // if (user.type !== "admin") return res.status(403).json({"message": "Admin only access this api", success: false})
    if (user.type !== "admin")
      return res
        .status(403)
        .json({ message: "Admin only access this api", success: false });
    req.user = user;
    next(); // pass the execution off to whatever request the client intended
  });
};
