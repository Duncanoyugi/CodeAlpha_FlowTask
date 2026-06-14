import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import logger from '../../lib/logger';

let transporter: nodemailer.Transporter;

if (env.NODE_ENV === 'production') {
  // Production: Use real SMTP
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 587,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
} else {
  // Development: Use ethereal.email for testing
  nodemailer.createTestAccount((err, account) => {
    if (err) {
      logger.error('Failed to create ethereal account:', err);
      return;
    }
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
    
    logger.info(`Ethereal email account created: ${account.user}`);
  });
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    
    if (env.NODE_ENV !== 'production') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
};

export const sendInviteEmail = async (to: string, workspaceName: string, inviterName: string, token: string) => {
  const inviteLink = `${env.FRONTEND_URL}/invite?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to TaskFlow!</h2>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> workspace.</p>
      <div style="margin: 30px 0;">
        <a href="${inviteLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Accept Invitation
        </a>
      </div>
      <p>Or copy this link: ${inviteLink}</p>
      <p>This invite expires in 7 days.</p>
      <hr />
      <p style="color: #666; font-size: 12px;">TaskFlow - Project Management Made Simple</p>
    </div>
  `;
  
  return sendEmail(to, `Invitation to join ${workspaceName} on TaskFlow`, html);
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const verifyLink = `${env.FRONTEND_URL}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email</h2>
      <p>Please verify your email address to get started with TaskFlow.</p>
      <div style="margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
      </div>
      <p>Or copy this link: ${verifyLink}</p>
      <p>This link expires in 24 hours.</p>
    </div>
  `;
  
  return sendEmail(to, 'Verify your TaskFlow account', html);
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>You requested to reset your password. Click the link below to proceed.</p>
      <div style="margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
          Reset Password
        </a>
      </div>
      <p>Or copy this link: ${resetLink}</p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    </div>
  `;
  
  return sendEmail(to, 'Reset your TaskFlow password', html);
};