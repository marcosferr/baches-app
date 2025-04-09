// Test script for email functionality
require("dotenv").config();
const nodemailer = require("nodemailer");

// Create a transporter with the SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASSWORD || "",
  },
});

// Process recipient email(s) - support for comma-separated list
const recipientEnv =
  process.env.EMAIL_NOTIFICATION_RECIPIENT || "admin@example.com";
const recipients = recipientEnv.includes(",")
  ? recipientEnv.split(",").map((email) => email.trim())
  : recipientEnv;

// Test email data
const mailOptions = {
  from: `${process.env.EMAIL_FROM_NAME || "Observatorio de Baches"} <${
    process.env.EMAIL_USER
  }>`,
  to: recipients,
  subject: "Test Email from Observatorio de Baches",
  text: "This is a test email to verify that the email service is working correctly.",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Test Email</h2>
      <p style="font-size: 16px; line-height: 1.5;">This is a test email to verify that the email service is working correctly.</p>
      <p style="font-size: 16px; line-height: 1.5;">Email configuration:</p>
      <ul>
        <li>Host: ${process.env.EMAIL_HOST}</li>
        <li>Port: ${process.env.EMAIL_PORT}</li>
        <li>Secure: ${process.env.EMAIL_SECURE}</li>
        <li>User: ${process.env.EMAIL_USER}</li>
      </ul>
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #777; font-size: 14px;">This is a test message, please ignore.</p>
    </div>
  `,
};

// Send the test email
async function sendTestEmail() {
  console.log("Sending test email...");
  console.log("Email configuration:");
  console.log(`- Host: ${process.env.EMAIL_HOST}`);
  console.log(`- Port: ${process.env.EMAIL_PORT}`);
  console.log(`- Secure: ${process.env.EMAIL_SECURE}`);
  console.log(`- User: ${process.env.EMAIL_USER}`);
  console.log(
    `- Recipients: ${
      Array.isArray(mailOptions.to) ? mailOptions.to.join(", ") : mailOptions.to
    }`
  );

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

// Run the test
sendTestEmail();
