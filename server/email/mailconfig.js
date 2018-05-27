import nodemailer from 'nodemailer';
import resetmailContent from './content/resetEmail';
import passupdatemailContent from './content/passupdateEmail';
import verifyemailContent from './content/verifyEmail';
import verifynewemailContent from './content/verifynewEmail';

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

const verifyEmail = (user, url)=>{
  const mailOptions = {
      from: 'Bikbox <do-not-reply@bikbox.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: 'Welcome to Bikbox', // Subject line
      text: `Hello ${user.firstname},\n\nWe are thrilled to see you here. But before anything, please verify your email so we know it's you:\n\n${url}\n\nIf you need additional assistance, please contact help@bikbox.com.\n\nBikbox Team`, // plain text body
      html: `${verifyemailContent(user,url)}` // html body
  };
  return mailOptions;
}

const verifyNewEmail = (user, url)=>{
  const mailOptions = {
      from: 'Bikbox <do-not-reply@bikbox.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: 'Verify your new email address', // Subject line
      text: `Hello ${user.firstname},\n\nYour email address has been changed, please verify your email so we know it's still you:\n\n${url}\n\nIf you did not make this request or need additional assistance, please contact help@bikbox.com.\n\nBikbox Team`, // plain text body
      html: `${verifynewemailContent(user,url)}` // html body
  };
  return mailOptions;
}
const resetEmail = (user, url)=>{
  const mailOptions = {
      from: 'Bikbox <do-not-reply@bikbox.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: 'Reset your password', // Subject line
      text: `Hello ${user.firstname},\n\nWe heard you need a password reset. Click the link below and you'll be redirected to a secure site from which you can set a new password:\n\n${url}\n\nIf you need additional assistance, or you did not make this change, please contact help@bikbox.com and we'll forget this ever happened.\n\nBikbox Team`, // plain text body
      html: `${resetmailContent(user,url)}` // html body
  };
  return mailOptions;
}

const passwordchangedEmail = (user)=>{
  const mailOptions = {
      from: 'Bikbox <do-not-reply@bikbox.com>', // sender address
      to: `${user.email}`, // list of receivers
      subject: 'Your password has been updated', // Subject line
      text: `Hello ${user.firstname},\n\nYour password has been updated.\n\nIf you did not make this request or need additional assistance, please contact help@bikbox.com.\n\nBikbox Team`, // plain text body
      html: `${passupdatemailContent(user)}` // html body
  };
  return mailOptions;
}

export { transporter, resetEmail, passwordchangedEmail, verifyEmail, verifyNewEmail };
