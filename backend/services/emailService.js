import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  return transporter;
}

async function sendMail({ to, subject, html }) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[email skipped - no SMTP config] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    });
  } catch (err) {
    // Email failures must never break the request flow
    console.error(`Failed to send email to ${to}: ${err.message}`);
  }
}

export async function sendHighInterestEmail({ ownerEmail, ownerName, tenantName, listingTitle, score, explanation }) {
  await sendMail({
    to: ownerEmail,
    subject: `🔥 Strong match (${score}%) interested in "${listingTitle}"`,
    html: `
      <p>Hi ${ownerName},</p>
      <p><strong>${tenantName}</strong> has expressed interest in your listing "<strong>${listingTitle}</strong>"
      with an AI compatibility score of <strong>${score}/100</strong>.</p>
      <p><em>${explanation}</em></p>
      <p>Log in to RooMatch to accept or decline this request.</p>
    `,
  });
}

export async function sendInterestReceivedEmail({ ownerEmail, ownerName, tenantName, listingTitle, score }) {
  await sendMail({
    to: ownerEmail,
    subject: `New interest in "${listingTitle}"`,
    html: `
      <p>Hi ${ownerName},</p>
      <p><strong>${tenantName}</strong> has expressed interest in your listing "<strong>${listingTitle}</strong>"
      (compatibility score: ${score}/100).</p>
      <p>Log in to RooMatch to respond.</p>
    `,
  });
}

export async function sendInterestDecisionEmail({ tenantEmail, tenantName, listingTitle, accepted }) {
  await sendMail({
    to: tenantEmail,
    subject: accepted
      ? `Your interest in "${listingTitle}" was accepted!`
      : `Update on your interest in "${listingTitle}"`,
    html: `
      <p>Hi ${tenantName},</p>
      <p>The owner has <strong>${accepted ? "accepted" : "declined"}</strong> your interest in
      "<strong>${listingTitle}</strong>".</p>
      ${accepted ? "<p>You can now chat with the owner in real time on RooMatch.</p>" : ""}
    `,
  });
}
