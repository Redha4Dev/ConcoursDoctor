import { BrevoClient, BrevoEnvironment } from "@getbrevo/brevo";
import "dotenv/config";

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
  environment: BrevoEnvironment.Default,
});

export const sendEmail = async ({
  emailto,
  subject,
  html,
  attachments, // Cleaned up destructuring
}: {
  emailto: string;
  subject: string;
  html: string;
  attachments?: { name: string; content: string }[]; // content must be base64
}): Promise<void> => {
  try {
    const result = await client.transactionalEmails.sendTransacEmail({
      sender: { email: process.env.EMAIL_SENDER!, name: "ConcourDoctora" },
      to: [{ email: emailto }],
      subject,
      htmlContent: html,
      attachment: attachments, // <-- Pass the array to Brevo here
    });

    console.log("Email sent successfully:", result);
  } catch (error) {
    console.error("Brevo error:", error);
    throw new Error("Failed to send email");
  }
};