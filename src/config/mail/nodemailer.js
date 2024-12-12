import nodemailer from "nodemailer";

const setting =
  process.env.NODE_ENV === "production"
    ? {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      }
    : {
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS,
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
