import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";

const setting =
  process.env.NODE_ENV === "production"
    ? sgTransport({
        auth: {
          api_key: process.env.SENDGRID_API_KEY,
        },
      })
    : {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      };

const transporter = nodemailer.createTransport(setting);

// Fungsi untuk mengirim email
const Email = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw new Error("Email delivery failed");
  }
};

export default Email;
