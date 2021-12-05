const nodemailer = require("nodemailer");
const axios = require('axios');


// const sendMail = async (options) => {
//   const reqbody = {
//     "Messages":[
//       {
//         "From": {
//           "Email": "danielameyaw@gmail.com",
//           "Name": "Cornerstone Giving"
//         },
//         "To": [
//           {
//             "Email": options.to,
//             "Name": "Cornerstone"
//           }
//         ],
//         "Subject": options.subject,
//         "TextPart": "Yes everyone.",
//         "HTMLPart": options.html,
//         "CustomID": "AppGettingStartedTest"
//       }
//     ]
//   };
//   axios.post('https://api.mailjet.com/v3.1/send', reqbody, {
//     headers: {
//       "Content-Type" : "application/json",
//       'Authorization' : 'Basic YWFhOWVmNDJmNmFiODJkZGNiMmJkYzViMzQ2MzYwMmQ6NmZkNWM4ZTdmZDlhZjFmNTM4ZmQ3ZjA0YTgzMTk0MWQ=',
//     }
//   }).then((response) => {
//     let responseBody = JSON.stringify(response.data);
//     console.log('Success mail sent:', responseBody);
//   }).catch((error) => {
//     console.error('Error response:', error);
//   });
//
// };


const sendMail = async (options) =>{
  const SibApiV3Sdk = require('sib-api-v3-sdk');
  let defaultClient = SibApiV3Sdk.ApiClient.instance;
  let apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = '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';
  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.htmlContent = options.html;
  sendSmtpEmail.sender = {"name":"Cornerstone","email":"noreply@cornerstone30.com"};
  sendSmtpEmail.to = [{"email":options.to}];
  sendSmtpEmail.headers = {"Some-Custom-Name":"unique-id-1234"};

  apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));

  }, function(error) {
    console.error('Error response:', error);
  });
};
module.exports = sendMail;
