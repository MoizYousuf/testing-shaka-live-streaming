const nodemailer = require("nodemailer");
const mailer = require("./mailer");
const { google } = require("googleapis");
let CLIENT_ID =
  "578314834933-2kgukjchjb65is80q03eij467rs472gm.apps.googleusercontent.com";
let CLEINT_SECRET = "yHKF2Sszw5RyvpkR6Afa79Cs";
let REDIRECT_URI = "https://developers.google.com/oauthplayground";
let REFRESH_TOKEN =
  "1//048hgcAYIZN3RCgYIARAAGAQSNwF-L9IrQ_TdM_fAt99ZTYU4pZKo-32wDDVCyH_x4-0sRH1lIaigJ4e6l2XPjvHQJYq22Pr7ACc";

async function mail(too) {
  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLEINT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  // let transporter = nodemailer.createTransport({
  //   service: "gmail", // true for 465, false for other ports
  //   auth: {
  //     user: mailer.MAILGUN_USER, // generated ethereal user
  //     pass: mailer.MAILGUN_PASSWORD, // generated ethereal password
  //   },
  //   // auth: {
  //   //   type: "OAuth2",
  //   //   user: mailer.MAILGUN_USER,
  //   //   accessToken: "zL55KJ9vh8_hfMQCEP3kftqJ",
  //   // },
  // });
  // var transporter = nodemailer.createTransport({
  //   host: "smtp.mailtrap.io",
  //   port: 2525,
  //   auth: {
  //     user: "c29e1c63d8a12d",
  //     pass: "94a1a34177ec45"
  //   }
  // });

  const accessToken = await oAuth2Client.getAccessToken();
  console.log("ACCESSTOKEN", accessToken.token);

  const transport = nodemailer.createTransport({
    service: "gmail",
    rejectUnauthorized: false,
    auth: {
      type: "OAuth2",
      user: "shakasportslive@gmail.com",
      clientId: CLIENT_ID,
      clientSecret: CLEINT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  const otp = Math.floor(100000 + Math.random() * 900000);
  // send mail with defined transport object
  let info = await transport.sendMail({
    from: "shakasportslive@gmail.com", // sender address
    to: too, // list of receivers
    subject: "SHAKA OTP", // Subject line
    text: "SHAKA HERE IS YOUR OTP COED", // plain text body
    html: `Your Otp Code is: <b>${otp}</b>`, // html body
  });

  console.log("MAIL SENT CHECK IT", otp);
  return otp;
}
module.exports = mail;
