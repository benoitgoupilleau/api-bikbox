const nodemailer = require('nodemailer');
const resetPasswordEmail = require('./content/resetPasswordEmail');
const passwordUpdateEmail = require('./content/passwordUpdateEmail');
const welcomeEmail = require('./content/welcomeEmail');
// const verifyNewEmail = require('./content/verifyNewEmail');

const transporter = nodemailer.createTransport({
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: !!process.env.SMTP_SECURE, // secure:true for port 465, secure:false for port 587
  auth: {
    user: process.env.SMTP_AUTH_USER,
    pass: process.env.SMTP_AUTH_PASSWORD
  },
  starttls: {
    enable: !!process.env.SMTP_STARTTLS
  },
  secureConnection: !!process.env.SMTP_SECURE_CONNECTION
});

const welcomeEmailPayload = (email, url)=>{
  const mailOptions = {
    from: "Bik'Box <do-not-reply@bikbox.com>", // sender address
    to: `${email}`, // list of receivers
    subject: "Bienvenue sur Bik'Box", // Subject line
    text: `Bonjour,\n\nNous sommes heureux de vous compter parmi nous. Mais avant toute chose, merci de définir votre mot de passe pour pouvoir accéder à l'interface :\n\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande ou avez besoin d'aide, n'hésitez pas à nous contacter : bonjour@bikbox.com.\n\nL'équipe Bik'Box`, // plain text body
    html: `${welcomeEmail(url)}` // html body
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
const resetPasswordEmailPayload = (email, url)=>{
  const mailOptions = {
    from: "Bik'box <do-not-reply@bikbox.com>", // sender address
    to: `${email}`, // list of receivers
    subject: 'Modifier votre mot de passe', // Subject line
    text: `Bonjour,\n\nNous avons reçu une demande de mot de passe. Le lien ci-dessous vous renverra sur un site sécurisé pour vous permettre de le modifier :\n\n${url}\n\nSi vous n'êtes pas à l'origine de cette demande ou avez besoin d'aide, n'hésitez pas à nous contacter : bonjour@bikbox.com.\n\nL'équipe Bik'Box`, // plain text body
    html: `${resetPasswordEmail(url)}` // html body
  };
  return mailOptions;
}

const passwordChangedEmailPayload = (email)=>{
  const mailOptions = {
    from: "Bik'Box <do-not-reply@bikbox.com>", // sender address
    to: `${email}`, // list of receivers
    subject: 'Votre mot de passe a été modifié', // Subject line
    text: `Bonjour,\n\nVotre mot de passe a été modifié.\n\nSi vous n'êtes pas à l'origine de cette demande, n'hésitez pas à nous contacter : bonjour@bikbox.com.\n\nL'équipe Bik'Box`, // plain text body
    html: `${passwordUpdateEmail()}` // html body
  };
  return mailOptions;
}

module.exports={ transporter, welcomeEmailPayload, resetPasswordEmailPayload, passwordChangedEmailPayload };
