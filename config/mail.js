const nodemailer = require("nodemailer");
const mailer = require("./mailer");
function mail(too) {
  let transporter = nodemailer.createTransport({
    service: "gmail", // true for 465, false for other ports
    auth: {
      user: mailer.MAILGUN_USER, // generated ethereal user
      pass: mailer.MAILGUN_PASSWORD, // generated ethereal password
    },
  });
  const otp = Math.floor(100000 + Math.random() * 900000);
  // send mail with defined transport object
  let info = transporter.sendMail({
    from: "moizyousuf24@gmail.com", // sender address
    to: too, // list of receivers
    subject: "SHAKA OTP", // Subject line
    text: "SHAKA HERE IS YOUR OTP COED", // plain text body
    html: `Your Otp Code is: <b>${otp}</b>`, // html body
  });
  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  return otp;
}
module.exports = mail;
