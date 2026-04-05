import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMail = async (options: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "ConcoursDoctor <onboarding@resend.dev>",
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    // 1. We must check the 'error' object from Resend
    if (error) {
      throw new Error(`Resend API Error: ${error.message}`);
    }

    console.log("✅ Email sent successfully:", data?.id);
    return data;
  } catch (err) {
    console.error("❌ Mailer Failure:", err);
    // 2. Re-throw so your forgotPassword try/catch can clear the DB tokens
    throw err;
  }
};
