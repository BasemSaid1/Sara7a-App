import nodemailer from "nodemailer";
import { USER_EMAIL, USER_PASS } from "../../../Config/config.service.js";

export async function sendEmail({
  to,
  subject,
  text,
  html,
  cc,
  bcc,
  attachments,
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: USER_EMAIL,
      pass: USER_PASS,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"Sara7a App" <${USER_EMAIL}>`,
      to,
      subject,
      text,
      html,
      cc,
      bcc,
      attachments,
    });

    console.log(`Email Sent: ${info.messageId}`);
  } catch (error) {
    console.log(`Error While Sending Email: ${error}`);
  }
}

export const sendSubject = {
  confirmEmail: "Confirm Your Email",
  resetPassword: "Reset Your Password",
  welcome: "Welcome To Sara7a App",
  contactUs: "Contact Us",
};
