import nodemailer from "nodemailer";

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

/**
 * Send an email
 * @param to Recipient email address
 * @param subject Email subject
 * @param text Plain text content
 * @param html HTML content (optional)
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  try {
    // Verify SMTP configuration is valid
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn("Email service not configured. Email not sent.");
      return false;
    }

    // Set up email data
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME || "Observatorio de Baches"} <${
        process.env.EMAIL_USER
      }>`,
      to,
      subject,
      text,
      html: html || text,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

/**
 * Send a notification email
 * @param to Recipient email address
 * @param title Notification title
 * @param message Notification message
 */
export async function sendNotificationEmail({
  to,
  title,
  message,
}: {
  to: string;
  title: string;
  message: string;
}) {
  const subject = `Notificación: ${title}`;
  const text = `${title}\n\n${message}\n\nEste es un mensaje automático, por favor no responda a este correo.`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">${title}</h2>
      <p style="font-size: 16px; line-height: 1.5;">${message}</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #777; font-size: 14px;">Este es un mensaje automático, por favor no responda a este correo.</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

/**
 * Send a report notification email to admin
 * @param reportDetails Details about the report
 */
export async function sendReportNotificationEmail(reportDetails: {
  id: string;
  description: string;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  address?: string;
  authorName: string;
}) {
  // Use the environment variable for the recipient email(s)
  // Support for comma-separated list of email addresses
  const recipientEnv =
    process.env.EMAIL_NOTIFICATION_RECIPIENT || "admin@example.com";
  const to = recipientEnv.includes(",")
    ? recipientEnv.split(",").map((email) => email.trim())
    : recipientEnv;
  const subject = `Nuevo reporte de bache: ${reportDetails.id}`;

  const text = `
Se ha creado un nuevo reporte de bache:

ID: ${reportDetails.id}
Descripción: ${reportDetails.description}
Severidad: ${reportDetails.severity}
Estado: ${reportDetails.status}
Ubicación: ${reportDetails.latitude}, ${reportDetails.longitude}
Dirección: ${reportDetails.address || "No disponible"}
Reportado por: ${reportDetails.authorName}

Este es un mensaje automático, por favor no responda a este correo.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Nuevo reporte de bache</h2>
      <p style="font-size: 16px; line-height: 1.5;">Se ha creado un nuevo reporte de bache:</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">ID:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            reportDetails.id
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Descripción:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            reportDetails.description
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Severidad:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            reportDetails.severity
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Estado:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            reportDetails.status
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Ubicación:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            reportDetails.latitude
          }, ${reportDetails.longitude}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Dirección:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            reportDetails.address || "No disponible"
          }</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">Reportado por:</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
            reportDetails.authorName
          }</td>
        </tr>
      </table>

      <p style="font-size: 16px; line-height: 1.5;">Puede ver más detalles en el panel de administración.</p>
      <hr style="border: 1px solid #eee; margin: 20px 0;" />
      <p style="color: #777; font-size: 14px;">Este es un mensaje automático, por favor no responda a este correo.</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}
