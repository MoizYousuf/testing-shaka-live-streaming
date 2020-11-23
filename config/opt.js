const Nexmo = require("nexmo");

const otp = (to) => {
  const nexmo = new Nexmo({
    apiKey: "d581f3d7",
    apiSecret: "r9rqpAR2nYejcFnQ",
  });

  const otp = Math.floor(100000 + Math.random() * 900000);
  const from = "Vonage APIs";
  const text = `SHAKA, Hello, How are you. your otp code is ${otp}`;
  nexmo.message.sendSms(from, Number(to), text);
  return otp;
  //   const to = to  ;
};
module.exports = otp;
