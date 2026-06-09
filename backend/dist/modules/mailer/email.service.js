"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.sendInviteEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../../config/env");
const logger_1 = __importDefault(require("../../lib/logger"));
let transporter;
if (env_1.env.NODE_ENV === 'production') {
    // Production: Use real SMTP
    transporter = nodemailer_1.default.createTransport({
        host: env_1.env.SMTP_HOST,
        port: env_1.env.SMTP_PORT,
        secure: env_1.env.SMTP_PORT === 465,
        auth: {
            user: env_1.env.SMTP_USER,
            pass: env_1.env.SMTP_PASS,
        },
    });
}
else {
    // Development: Use ethereal.email for testing
    nodemailer_1.default.createTestAccount((err, account) => {
        if (err) {
            logger_1.default.error('Failed to create ethereal account:', err);
            return;
        }
        transporter = nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: account.user,
                pass: account.pass,
            },
        });
        logger_1.default.info(`Ethereal email account created: ${account.user}`);
    });
}
const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: env_1.env.EMAIL_FROM,
            to,
            subject,
            html,
        });
        if (env_1.env.NODE_ENV !== 'production') {
            logger_1.default.info(`Preview URL: ${nodemailer_1.default.getTestMessageUrl(info)}`);
        }
        return info;
    }
    catch (error) {
        logger_1.default.error('Email send error:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
const sendInviteEmail = async (to, workspaceName, inviterName, token) => {
    const inviteLink = `${env_1.env.FRONTEND_URL}/invite?token=${token}`;
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
    return (0, exports.sendEmail)(to, `Invitation to join ${workspaceName} on TaskFlow`, html);
};
exports.sendInviteEmail = sendInviteEmail;
const sendVerificationEmail = async (to, token) => {
    const verifyLink = `${env_1.env.FRONTEND_URL}/verify-email?token=${token}`;
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
    return (0, exports.sendEmail)(to, 'Verify your TaskFlow account', html);
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (to, token) => {
    const resetLink = `${env_1.env.FRONTEND_URL}/reset-password?token=${token}`;
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
    return (0, exports.sendEmail)(to, 'Reset your TaskFlow password', html);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
