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
    donation.pageId= uuid.v4();
    donation.amount=req.body.amount;
    donation.paymentMode = req.body.paymentMode;
    donation.donationTypeId = req.body.donationType;
    donation.paymentStatus ="01";
    donation.statusMessage = "pending";
    donation.settlementStatus = "PENDING";
    db.ChurchDonation.create(donation);
    res.json({ status: "00", paymentUrl : "/paymentPage/"+donation.pageId,reference:donation.pageId });
};

Controller.paymentPage = async (req, res) => {
    db.ChurchDonation.findOne({where:{pageId:req.params.pageId}})
        .then(function (donation) {
            if(donation && donation.paymentStatus==="01"){
              // Create a PaymentIntent with the order amount and currency
                if(donation.paymentMode==="paypal"){
                    donation.paymentMode='paypal';
                    return renderPaypalPayment(donation,res)
                }else{
                    donation.paymentMode='stripe';
                    return renderStripePayment(donation,res)
                }
            }else{
                return res.render("payment-not-found",{layout:"payment-layout"});
            }
        })
};

function renderStripePayment(donation,res){
    // Create a PaymentIntent with the order amount and currency
    const intent={
        amount: 1500, //todo calculate payment
        currency: "usd"
    };
    console.log('The intent is >>>',intent);
    stripe.paymentIntents.create(intent).then(function (paymentIntent) {
        let buff = new Buffer(paymentIntent.client_secret);
        const clientSecret= buff.toString('base64');
        return res.render( "payment-page", {paymentMode:donation.paymentMode,pageId:donation.pageId, clientSecret:clientSecret,stripePublicKey:config.stripe_publicKey ,layout: "payment-layout",title:"Pay with Card"});
    }).catch(err=>{
        console.log(err);
        return res.render("payment-error",{layout:"payment-layout"})
    });
}

function renderPaypalPayment(donation,res){
    const amount=1500; //todo calculate amount
    return res.render( "payment-page", { paymentMode:donation.paymentMode,pageId:donation.pageId,payPalClientId:config.paypal_client_id,layout: "payment-layout",title:"Pay with PayPal",amount:amount});
}

Controller.setPaymentStatus = function (req,res){
    db.ChurchDonation.findOne({where:{pageId:req.params.pageId}})
        .then(function (donation) {
            if(donation && donation.paymentStatus==="01"){ //todo change to time base not more than 5 mins of creation
                donation.responseText = JSON.stringify(req.body.data);
                donation.paymentStatus =req.body.status;
                donation.save();
                res.json({status:"00",message:"Payment status updated"})
            }else{
                res.status(404).json({status:"404",message:"Not found"})
            }
        })
};


Controller.paymentStatus = async (req, res) => {
    db.ChurchDonation.findOne({where:{pageId:req.params.pageId}})
        .then(function (donation) {
            if(donation){
               return  res.json({status:donation.paymentStatus, message:donation.statusMessage})
            }else{
                return res.status(404).json({status:"404",message:"Not Found"})
            }
        })
};



const calculateOrderAmount = donation => {
    console.log('Donation object >>',donation.toJSON());
    //todo add charge fees if any
    console.log("the donation amount is >>>",donation.amount);
    return Number(Number(donation.amount)*100);
};