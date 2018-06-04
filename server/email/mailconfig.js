const nodemailer = require('nodemailer');
const resetPasswordEmail = require('./content/resetPasswordEmail');
const passwordUpdateEmail = require('./content/passwordUpdateEmail');
const welcomeEmail = require('./content/welcomeEmail');
// const verifyNewEmail = require('./content/verifyNewEmail');

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE, // secure:true for port 465, secure:false for port 587
  auth: {
    user: process.env.SMTP_AUTH_USER,
    pass: process.env.SMTP_AUTH_PASSWORD
  },
  starttls: {
    enable: process.env.SMTP_STARTTLS
  },
  secureConnection: process.env.SMTP_SECURE_CONNECTION
});

const welcomeEmailPayload = (user, url)=>{
  const mailOptions = {
    from: "Bik'Box <do-not-reply@bikbox.com>", // sender address
    to: `${user.email}`, // list of receivers
    subject: "Bienvenue sur Bik'Box", // Subject line
    text: `Bonjour ${user.firstname},\n\nNous sommes heureux de vous compter parmi nous. Mais avant toute chose, merci de définir votre mot de passe pour pouvoir accéder à l'interface :\n\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande ou avez besoin d'aide, n'hésitez pas à nous contacter : bonjour@bikbox.com.\n\nL'équipe Bik'Box`, // plain text body
    html: `${welcomeEmail(user,url)}` // html body
  };
  return mailOptions;
}

// const verifyNewEmailPayload = (user, url)=>{
//   const mailOptions = {
//     from: "Bik'box <do-not-reply@bikbox.com>", // sender address
//     to: `${user.email}`, // list of receivers
//     subject: 'Verify your new email address', // Subject line
//     text: `Hello ${user.firstname},\n\nYour email address has been changed, please verify your email so we know it's still you:\n\n${url}\n\nIf you did not make this request or need additional assistance, please contact help@bikbox.com.\n\nBikbox Team`, // plain text body
//     html: `${verifyNewEmail(user,url)}` // html body
//   };
//   return mailOptions;
// }
const resetPasswordEmailPayload = (user, url)=>{
  const mailOptions = {
    from: "Bik'box <do-not-reply@bikbox.com>", // sender address
    to: `${user.email}`, // list of receivers
    subject: 'Reset your password', // Subject line
    text: `Hello ${user.firstname},\n\nWe heard you need a password reset. Click the link below and you'll be redirected to a secure site = require(which you can set a new password:\n\n${url}\n\nIf you need additional assistance, or you did not make this change, please contact help@bikbox.com and we'll forget this ever happened.\n\nBikbox Team`, // plain text body
    html: `${resetPasswordEmail(user,url)}` // html body
  };
  return mailOptions;
}

const passwordChangedEmailPayload = (user)=>{
  const mailOptions = {
    from: "Bik'box <do-not-reply@bikbox.com>", // sender address
    to: `${user.email}`, // list of receivers
    subject: 'Your password has been updated', // Subject line
    text: `Hello ${user.firstname},\n\nYour password has been updated.\n\nIf you did not make this request or need additional assistance, please contact help@bikbox.com.\n\nBikbox Team`, // plain text body
    html: `${passwordUpdateEmail(user)}` // html body
  };
  return mailOptions;
}

module.exports={ transporter, welcomeEmailPayload, resetPasswordEmailPayload, passwordChangedEmailPayload };
