import { EventEmitter } from "node:events";
import { sendEmail, sendSubject } from "../email/email.utils.js";
import { template } from "../email/generateHTML.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: sendSubject.confirmEmail,
      html: template(data.otp, data.userName, sendSubject.confirmEmail),
    });
  } catch (error) {
    console.log("Error Sending Email", error);
  }
});

emailEvent.on("forgetPassword", async (data) => {
  try {
    await sendEmail({
      to: data.to,
      subject: sendSubject.resetPassword,
      html: template(data.otp, data.userName, sendSubject.resetPassword),
    });
  } catch (error) {
    console.log("Error Sending Email", error);
  }
});
