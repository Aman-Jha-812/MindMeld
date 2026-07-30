import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

const FROM_ADDRESS = `"MindMeld" <${process.env.SMTP_USER}>`;

async function sendEmail({ to, subject, text, html }) {
  try {
    const info = await getTransporter().sendMail({
      from: FROM_ADDRESS,
      to,
      subject,
      text,
      html,
    });
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('sendEmail error:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

async function sendWelcomeEmail(email, name) {
  const subject = 'Welcome to MindMeld!';
  const text = `Hi ${name},\n\nWelcome to MindMeld! We're excited to have you on board. Start collaborating with your team and boost your productivity.\n\nBest,\nThe MindMeld Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Welcome to MindMeld!</h2>
      <p>Hi ${name},</p>
      <p>Welcome to <strong>MindMeld</strong>! We're excited to have you on board.</p>
      <p>Start collaborating with your team and boost your productivity.</p>
      <hr style="border: 1px solid #e5e7eb;" />
      <p style="color: #6b7280; font-size: 12px;">Best,<br/>The MindMeld Team</p>
    </div>`;
  return sendEmail({ to: email, subject, text, html });
}

async function sendInviteEmail(email, workspaceName, inviteLink) {
  const subject = `You're invited to join ${workspaceName} on MindMeld`;
  const text = `You have been invited to join ${workspaceName} on MindMeld.\n\nClick the link below to accept the invitation:\n${inviteLink}\n\nBest,\nThe MindMeld Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Workspace Invitation</h2>
      <p>You have been invited to join <strong>${workspaceName}</strong> on MindMeld.</p>
      <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Accept Invitation</a>
      <p style="color: #6b7280; font-size: 12px;">Best,<br/>The MindMeld Team</p>
    </div>`;
  return sendEmail({ to: email, subject, text, html });
}

async function sendPasswordResetEmail(email, resetLink) {
  const subject = 'Password Reset - MindMeld';
  const text = `You requested a password reset.\n\nClick the link below to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.\n\nBest,\nThe MindMeld Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Password Reset</h2>
      <p>You requested a password reset for your MindMeld account.</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
      <p style="color: #6b7280; font-size: 12px;">If you did not request this, please ignore this email.</p>
      <p style="color: #6b7280; font-size: 12px;">Best,<br/>The MindMeld Team</p>
    </div>`;
  return sendEmail({ to: email, subject, text, html });
}

export { sendEmail, sendWelcomeEmail, sendInviteEmail, sendPasswordResetEmail };
