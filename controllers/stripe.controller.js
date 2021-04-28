const db = require('../models');
const uuid = require('uuid');
const config = require("../config/config");
const stripe = require("stripe")(config.stripe_apiKey);

const Controller = {};
module.exports = Controller;

Controller.initiatePaymentIntent = async (req, res) => {
    const user = req.user;
    const donation ={};
    donation.churchId = req.user.churchId;
    donation.userId= user.id;
    donation.pageId = uuid.v4();
    donation.amount =req.body.amount;
    donation.paymentMode = req.body.paymentMode;
    donation.donationTypeId = req.body.donationType;
    donation.paymentStatus ="01";
    donation.statusMessage = "pending";
    db.ChurchDonation.create(donation);
    res.json({ status: "00", paymentUrl : "/paymentPage/"+donation.pageId });
};

Controller.paymentPage = async (req, res) => {
    db.ChurchDonation.findOne({where:{pageId:req.params.pageId}})
        .then(function (donation) {
            if(donation){
              // Create a PaymentIntent with the order amount and currency
              stripe.paymentIntents.create({
                    amount: calculateOrderAmount(donation),
                    currency: "usd"
                }).then(function (paymentIntent) {
                  const page = "paymentPage";
                  let buff = new Buffer(paymentIntent.client_secret);
                  const clientSecret= buff.toString('base64');
                  return res.render(page, { clientSecret:clientSecret });
              });
            }else{
                return res.render("paymentNotFound");
            }
        })
};


const calculateOrderAmount = donation => {
    //todo add charge fees if any
    return donation.amount;
};