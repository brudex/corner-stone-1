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
                const intent={
                    amount: 1500,
                    currency: "usd"
                };
                console.log('The intent is >>>',intent);
              stripe.paymentIntents.create(intent).then(function (paymentIntent) {
                  const page = "payment-page";
                  let buff = new Buffer(paymentIntent.client_secret);
                  const clientSecret= buff.toString('base64');
                  return res.render( "payment-page", { clientSecret:clientSecret ,layout: "payment-layout",title:"Pay with Card"});
              }).catch(err=>{
                  console.log(err);
                 return res.render("payment-error",{layout:"payment-layout"})
              });
            }else{
                return res.render("payment-not-found",{layout:"payment-layout"});
            }
        })
};


const calculateOrderAmount = donation => {
    console.log('Donation object >>',donation.toJSON());
    //todo add charge fees if any
    console.log("the donation amount is >>>",donation.amount);
    return Number(donation.amount);
};