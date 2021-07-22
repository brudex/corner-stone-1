const nodemailer = require("nodemailer");
const axios = require('axios');
// const sendMail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: "server283.web-hosting.com",
//     auth: {
//       user: "test@senyotheart.com",
//       pass: "06k9uQfsAn",
//     },
//     secure: true,
//   });
//   await transporter.sendMail(options);
// };

const sendMail = async (options) => {
  const reqbody = {
    "Messages":[
      {
        "From": {
          "Email": "zenoteck.cornerstone@gmail.com",
          "Name": "Cornerstone Giving"
        },
        "To": [
          {
            "Email": options.to,
            "Name": "Cornerstone"
          }
        ],
        "Subject": options.subject,
        "TextPart": "Yes everyone.",
        "HTMLPart": options.html,
        "CustomID": "AppGettingStartedTest"
      }
    ]
  };
  axios.post('https://api.mailjet.com/v3.1/send', reqbody, {
    headers: {
      "Content-Type" : "application/json",
      'Authorization' : 'Basic YWFhOWVmNDJmNmFiODJkZGNiMmJkYzViMzQ2MzYwMmQ6NmZkNWM4ZTdmZDlhZjFmNTM4ZmQ3ZjA0YTgzMTk0MWQ=',
    }
  }).then((response) => {
    let responseBody = JSON.stringify(response.data);
    console.log('Success mail sent:', responseBody);
  }).catch((error) => {
    console.error('Error response:', error);
  });

};
module.exports = sendMail;
