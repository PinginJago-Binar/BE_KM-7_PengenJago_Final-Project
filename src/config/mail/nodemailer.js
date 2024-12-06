import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";

const transporter = nodemailer.createTransport(
  sgTransport({
    auth: {
      api_key: process.env.SENDGRID_API_KEY, // API Key dari SendGrid
    },
  })
);

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
