import nodemailer from "nodemailer";
import smtpTransport from "nodemailer/lib/smtp-transport";

const transporter = nodemailer.createTransport(
    new smtpTransport({
        service: 'Gmail',
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD,
        },
    })
);

export default async function sendMail(toEmail, subject, htmlContent) {

    var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: toEmail,
        subject: subject || "Welcome to Teqnoman Web Solutions Webportal",
        html: htmlContent
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            throw new Error(err);
        } else {
            return info;
        }
    })
}