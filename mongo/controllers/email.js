var mongoose = require('mongoose');
var User = mongoose.model('User');
var nodemailer = require('nodemailer');
var config  = require('../../custom_configFile.json');
var smtpTransport = nodemailer.createTransport("SMTP",{
    service: "Gmail",
    auth: {
        user: config.emailID,
        pass: config.emailPW
    }
});

var rand,mailOptions,host,link;

module.exports.send = function(req, res) {
    // console.log(req.get('host'));
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/api/verify?id="+rand;
    mailOptions={
        to : req.param("to"), 
        subject : "Please confirm your Loklak Web Client account",
        html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
            res.end("error");
            
        }else{
            console.log("Message sent: " + response.message);
            res.end("sent");
        }
    });

};

module.exports.verify = function(req,res){
    console.log(req.protocol+":/"+req.get('host'));
    if((req.protocol+"://"+req.get('host'))==("http://"+host)) {
        console.log("Domain is matched. Information is from Authentic email");
        if(req.param('id')==rand) {
            console.log("email is verified");
            User.update({email: mailOptions.to}, {$set: {isVerified: true}}, function(err,user){
                if(err) {
                    res.status(404).json(err);
                    return;
                }
                // res.end("Email "+mailOptions.to+" is Successfully verified");
                res.redirect('/');
            })
        } else {
            console.log("email is not verified");
            res.end("There was an error in verification");
        }
    }
    else {
        res.end("Request is from unknown source");
    }
};


