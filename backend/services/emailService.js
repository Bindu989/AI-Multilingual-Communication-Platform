const { Resend } = require("resend");

console.log("RESEND EMAIL SERVICE LOADED");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text }) => {
  console.log("SENDING EMAIL TO:", to);

  const result = await resend.emails.send({
    from: "AI Multilingual Platform <onboarding@resend.dev>",
    to: [to],
    subject: subject,
    text: text,
  });

  if (result.error) {
    console.error("RESEND EMAIL FAILED:", result.error);
    throw new Error(result.error.message || "Email sending failed");
  }

  console.log("EMAIL SENT:", result.data?.id);

  return result.data;
};

module.exports = {
  sendEmail,
};