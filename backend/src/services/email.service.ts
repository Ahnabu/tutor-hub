import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { EmailOutbox } from '../models/EmailOutbox.js';
import { EmailOutboxStatus } from '../enums/index.js';

// Nodemailer SMTP Transporter
export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export class EmailService {
  /**
   * Enqueue an email into the EmailOutbox collection for processing and immediate dispatch
   */
  static async enqueue(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    const outbox = await EmailOutbox.create({
      to,
      subject,
      html,
      text: text || subject,
      status: EmailOutboxStatus.PENDING,
      attempts: 0,
      nextRetryAt: new Date(),
    });

    // In test environment, skip network SMTP to keep tests isolated and fast
    if (env.NODE_ENV === 'test') {
      return;
    }

    // Direct synchronous dispatch (vital for serverless like Vercel where background loops are frozen)
    try {
      if (env.SMTP_HOST && env.SMTP_USER) {
        await transporter.sendMail({
          from: env.EMAIL_FROM,
          to,
          subject,
          html,
          text: text || subject,
        });

        outbox.status = EmailOutboxStatus.SENT;
        outbox.sentAt = new Date();
        outbox.attempts = 1;
        await outbox.save();
      }
    } catch (err: any) {
      console.error(`Immediate email dispatch to ${to} deferred to outbox worker:`, err.message);
    }
  }

  /**
   * Helper to send an Email Verification OTP email
   */
  static async sendVerificationOtp(to: string, name: string, otp: string): Promise<void> {
    const subject = `${otp} is your TutorHub verification code`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #090D16; color: #F8FAFC; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #10B981; margin-bottom: 8px;">Welcome to TutorHub</h2>
        <p style="font-size: 16px; color: #94A3B8;">Hello ${name},</p>
        <p style="font-size: 16px; color: #E2E8F0;">Please use the following 6-digit verification code to complete your registration:</p>
        <div style="margin: 24px 0; padding: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid #10B981; border-radius: 8px; text-align: center;">
          <span style="font-family: monospace; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #10B981;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #64748B;">This code will expire in 15 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.08); margin: 24px 0;" />
        <p style="font-size: 12px; color: #475569;">TutorHub Bangladesh • Dhaka, Bangladesh</p>
      </div>
    `;
    await this.enqueue(to, subject, html);
  }

  /**
   * Helper to send a Password Reset token email
   */
  static async sendPasswordReset(to: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${env.CORS_ORIGIN}/reset-password?token=${resetToken}`;
    const subject = 'Reset your TutorHub password';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #090D16; color: #F8FAFC; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #F59E0B; margin-bottom: 8px;">Password Reset Request</h2>
        <p style="font-size: 16px; color: #94A3B8;">Hello ${name},</p>
        <p style="font-size: 16px; color: #E2E8F0;">We received a request to reset your password. Click the button below to set a new password:</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${resetUrl}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="font-size: 14px; color: #64748B;">This link is valid for 1 hour. If you did not make this request, please change your password immediately.</p>
      </div>
    `;
    await this.enqueue(to, subject, html);
  }

  /**
   * Helper to send a Guardian Claim invite email
   */
  static async sendGuardianClaimInvite(
    to: string,
    guardianLabel: string,
    teacherName: string,
    claimToken: string
  ): Promise<void> {
    const claimUrl = `${env.CORS_ORIGIN}/claim-guardian?token=${claimToken}`;
    const subject = `Tuition progress access invite from ${teacherName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #090D16; color: #F8FAFC; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
        <h2 style="color: #10B981; margin-bottom: 8px;">TutorHub Guardian Portal</h2>
        <p style="font-size: 16px; color: #94A3B8;">Hello ${guardianLabel},</p>
        <p style="font-size: 16px; color: #E2E8F0;">${teacherName} has invited you to view live tuition session logs, attendance, and homework tracking on TutorHub.</p>
        <div style="margin: 24px 0; text-align: center;">
          <a href="${claimUrl}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Activate Guardian Portal</a>
        </div>
        <p style="font-size: 14px; color: #64748B;">This invitation is valid for 14 days.</p>
      </div>
    `;
    await this.enqueue(to, subject, html);
  }
}

/**
 * Worker that polls pending emails from EmailOutbox and sends them via SMTP
 */
export class EmailWorker {
  private static timer: NodeJS.Timeout | null = null;
  private static isProcessing = false;

  static start(intervalMs = 5000): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.processOutbox().catch((err) => {
        console.error('EmailWorker error:', err);
      });
    }, intervalMs);
    console.log(`✉️ EmailOutbox worker started (polling every ${intervalMs / 1000}s)`);
  }

  static stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  static async processOutbox(): Promise<void> {
    if (this.isProcessing) return;
    if (mongoose.connection.readyState !== 1) return;
    this.isProcessing = true;

    try {
      const now = new Date();
      // Find up to 10 pending or retriable emails
      const emails = await EmailOutbox.find({
        status: { $in: [EmailOutboxStatus.PENDING, EmailOutboxStatus.PROCESSING] },
        nextRetryAt: { $lte: now },
        attempts: { $lt: 5 }, // max 5 attempts
      }).limit(10);

      for (const email of emails) {
        email.status = EmailOutboxStatus.PROCESSING;
        email.attempts += 1;
        email.lastAttemptAt = now;
        await email.save();

        try {
          await transporter.sendMail({
            from: env.EMAIL_FROM,
            to: email.to,
            subject: email.subject,
            html: email.html,
            text: email.text,
          });

          email.status = EmailOutboxStatus.SENT;
          email.sentAt = new Date();
          await email.save();
        } catch (err: any) {
          console.error(`Failed to send email to ${email.to}:`, err.message);
          email.error = err.message;
          if (email.attempts >= 5) {
            email.status = EmailOutboxStatus.FAILED;
          } else {
            email.status = EmailOutboxStatus.PENDING;
            // Exponential backoff: 30s, 2m, 8m, 32m
            const delaySec = Math.pow(4, email.attempts) * 30;
            email.nextRetryAt = new Date(Date.now() + delaySec * 1000);
          }
          await email.save();
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }
}
