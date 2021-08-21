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
    donation.amount2= (0.9605)*Number(req.body.amount); //amount minus charges
    donation.paymentMode = req.body.paymentMode.toLowerCase();
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
                return res.render("payment-not-found",{layout:"payment-layout",title:"Payment Error"});
            }
        })
};

Controller.paymentResult = async (req, res) => {
    if(req.params.status==="success"){
        return res.render("payment-status",{layout:"white-layout",title:"Payment Success",status:"success"});
    }else{
        return res.render("payment-status",{layout:"white-layout",title:"Payment Failed",status:"failed"});
    }
};

function renderStripePayment(donation,res){
    // Create a PaymentIntent with the order amount and currency
    const intent={
        amount: calculateOrderAmount(donation),
        currency: "usd"
    };
    console.log('The intent is >>>',intent);
    stripe.paymentIntents.create(intent).then(function (paymentIntent) {
        let buff = new Buffer(paymentIntent.client_secret);
        const clientSecret= buff.toString('base64');
        return res.render( "payment-page", {paymentMode:donation.paymentMode,pageId:donation.pageId, clientSecret:clientSecret,stripePublicKey:config.stripe_publicKey ,layout: "payment-layout",title:"Pay with Card"});
    }).catch(err=>{
        console.log(err);
        return res.render("payment-error",{layout:"payment-layout",title:"Payment Error"})
    });
}

function renderPaypalPayment(donation,res){
    const amount=calculateOrderAmount(donation);
    return res.render( "payment-page", { paymentMode:donation.paymentMode,pageId:donation.pageId,payPalClientId:config.paypal_client_id,layout: "payment-layout",title:"Pay with PayPal",amount:amount});
}

Controller.setPaymentStatus = function (req,res){
    db.ChurchDonation.findOne({where:{pageId:req.params.pageId}})
        .then(function (donation) {
            console.log('Payment status payload >>>',req.body);
            if(donation && donation.paymentStatus==="01"){ //todo change to time base not more than 5 mins of creation
                donation.responseText = req.body.data;
                donation.paymentStatus =req.body.status;
                donation.statusMessage = req.body.statusMessage;
                if(donation.paymentMode==='stripe' && donation.paymentStatus==="00"){
                    const paymentDetails = JSON.parse(req.body.paymentIntent.id);
                }
                if(donation.paymentMode==='paypal' && donation.paymentStatus==="00"){
                    const paymentDetails = JSON.parse(req.body.data);
                    donation.paymentReference = paymentDetails.id;
                 }
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
    console.log("the donation amount is >>>",donation.amount);
    if(donation.paymentMode=== 'stripe'){
        return Number(Number(donation.amount)*100);
    }
    return Number(donation.amount);
};