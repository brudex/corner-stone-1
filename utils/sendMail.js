const nodemailer = require("nodemailer");
const sendMail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: "server283.web-hosting.com",
    auth: {
      user: "test@senyotheart.com",
      pass: "06k9uQfsAn",
    },
    secure: true,
  });
  await transporter.sendMail(options);
};
module.exports = sendMail;
