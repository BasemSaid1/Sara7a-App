export const template = (code, userName, subject) => `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8" />
<title>Confirm Your Email</title>
</head>
<body style="margin:0; padding:0; background-color:#eeeeee; font-family: Arial, Helvetica, sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#eeeeee; padding:30px 0;">
    <tr>
      <td align="center">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:6px; overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#0d80f2; padding:30px 20px; text-align:center;">
              <h1 style="color:#ffffff; margin:0; font-size:26px; font-weight:bold;">${subject}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:35px 40px 10px;">
              <p style="font-size:18px; color:#0d80f2; font-weight:bold; margin:0 0 20px;">
                Hello ${userName},
              </p>
              <p style="font-size:14px; color:#333333; line-height:1.7; margin:0 0 25px;">
                Thank you for signing up with Route Academy. To complete your registration and start using your account, please get code to activate your account:
              </p>
            </td>
          </tr>

          <!-- OTP Box -->
          <tr>
            <td style="padding:0 40px 25px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#0d80f2; border-radius:5px; padding:14px 30px;">
                    <span style="color:#ffffff; font-size:18px; font-weight:bold; letter-spacing:2px;">
                      ${code}
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer note -->
          <tr>
            <td style="padding:10px 40px 30px;">
              <p style="font-size:14px; color:#333333; margin:0 0 20px;">
                If you did not sign up for this account, please ignore this email.
              </p>
              <p style="font-size:14px; color:#333333; margin:0;">
                Best regards,<br/>
                Sara7a Application Team
              </p>
            </td>
          </tr>

          <!-- Bottom footer -->
          <tr>
            <td style="background-color:#f3f3f3; padding:20px 40px; text-align:center;">
              <p style="font-size:12px; color:#888888; margin:0 0 8px;">
                © 2026 Sara7a App. All rights reserved.
              </p>
              <p style="font-size:12px; margin:0;">
                <a href="#" style="color:#0d80f2; text-decoration:underline;">Contact Support</a>
                <span style="color:#888888;"> | </span>
                <a href="#" style="color:#0d80f2; text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
