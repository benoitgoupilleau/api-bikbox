const nodemailer= require('nodemailer');
var resetmailContent = require('./content/resetEmail');
var passupdatemailContent = require('./content/passupdateEmail');
var verifyemailContent = require('./content/verifyEmail');
var verifynewemailContent = require('./content/verifynewEmail');

var transporter = nodemailer.createTransport({
    service: 'SSL0.OVH.NET',
    host: 'SSL0.OVH.NET',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'techno@bikbox.com',
        pass: process.env.EMAIL_PASSWORD
    },
    starttls: {
      enable: true
    },
    secureConnection: true
});

var verifyEmail = (user, url)=>{
  var mailOptions = {
      from: '"Bikbox" <do-not-reply@bikbox.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: 'Welcome to Bikbox', // Subject line
      text: `Hello ${user.firstname},\n\nWe are thrilled to see you here. But before anything, please verify your email so we know it's you:\n\n${url}\n\nIf you need additional assistance, please contact help@bikbox.com.\n\nBikbox Team`, // plain text body
      html: `${verifyemailContent(user,url)}` // html body
  };
  return mailOptions;
}

var verifyNewEmail = (user, url)=>{
  var mailOptions = {
      from: '"Bikbox" <do-not-reply@bikbox.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: 'Verify your new email address', // Subject line
      text: `Hello ${user.firstname},\n\nYour email address has been changed, please verify your email so we know it's still you:\n\n${url}\n\nIf you did not make this request or need additional assistance, please contact help@bikbox.com.\n\nBikbox Team`, // plain text body
      html: `${verifynewemailContent(user,url)}` // html body
  };
  return mailOptions;
}
var resetEmail = (user, url)=>{
  var mailOptions = {
      from: '"Bikbox" <do-not-reply@bikbox.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: 'Reset your password', // Subject line
      text: `Hello ${user.firstname},\n\nWe heard you need a password reset. Click the link below and you'll be redirected to a secure site from which you can set a new password:\n\n${url}\n\nIf you need additional assistance, or you did not make this change, please contact help@bikbox.com and we'll forget this ever happened.\n\nBikbox Team`, // plain text body
      html: `${resetmailContent(user,url)}` // html body
  };
  return mailOptions;
}

var passwordchangedEmail = (user)=>{
  var mailOptions = {
      from: '"Bikbox" <do-not-reply@bikbox.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: 'Your password has been updated', // Subject line
      text: `Hello ${user.firstname},\n\nYour password has been updated.\n\nIf you did not make this request or need additional assistance, please contact help@bikbox.com.\n\nBikbox Team`, // plain text body
      html: `${passupdatemailContent(user)}` // html body
  };
  return mailOptions;
}

module.exports={transporter, resetEmail, passwordchangedEmail, verifyEmail, verifyNewEmail};
