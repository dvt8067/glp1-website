import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fetch from "node-fetch";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;
const EMAIL_SENDER_SECRET = process.env.EMAIL_SENDER_SECRET;
const EMAIL_SENDER_PASSWORD_SECRET = process.env.EMAIL_SENDER_PASSWORD_SECRET;
const EMAIL_RECEIVER_SECRET = process.env.EMAIL_RECEIVER_SECRET;
//Define the transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: EMAIL_SENDER_SECRET,
    pass: EMAIL_SENDER_PASSWORD_SECRET,
  },
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/contact", async (req, res) => {
  const { name, email, formMessage, recaptcha } = req.body;

  // Build the verification URL
  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${recaptcha}`;

  try {
    // Verify the reCAPTCHA token with Google
    const captchaRes = await fetch(verifyURL, { method: "POST" });
    const captchaData = await captchaRes.json();

    if (!captchaData.success || captchaData.score < 0.5) {
      return res.status(400).json({
        responseMessage: "reCAPTCHA verification failed.",
        score: captchaData.score,
      });
    }

    console.log("Received contact form:", { name, email, formMessage });
    console.log("Attempting to send email with nodemailer...");
    const info = await transporter.sendMail({
      from: '"Coach Mike Website Form" <' + EMAIL_SENDER_SECRET + ">",
      to: EMAIL_RECEIVER_SECRET,
      subject: "New GLP-1 Website Contact Form Submission",
      text: `You have a new contact form submission from ${name} <${email}>: ${formMessage}`,
      html: `<p>You have a new contact form submission from <strong>${name}</strong> &lt;<strong>${email}</strong>&gt;:</p><p>${formMessage}</p>`,
    });
    console.log("Contact Message sent to:", EMAIL_RECEIVER_SECRET);
    console.log("Attempting to send acknowledgment email to:", email);
    const infoAck = await transporter.sendMail({
      from: '"Coach Mike Website Form" <' + EMAIL_SENDER_SECRET + ">",
      to: email,
      subject: "Acknowledgment: Coach Mike Received Your Message",
      text: `Thank you for reaching out, ${name}! I have received your message and will get back to you shortly.`,
      html: `<p>Thank you for reaching out, <strong>${name}</strong>! I have received your message and will get back to you shortly.</p>`,
    });
    console.log("Acknowledgment email sent to:", email);
    res.json({
      responseMessage:
        "After verifying reCAPTCHA, email has been sent successfully!",
    });
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    res
      .status(500)
      .json({ responseMessage: "Server error during reCAPTCHA verification." });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
