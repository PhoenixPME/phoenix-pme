import nodemailer from 'nodemailer';
import { config } from '../config';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  template: string;
  data?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType?: string;
  }>;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const html = this.generateTemplate(options.template, options.data || {});
      
      const mailOptions = {
        from: `"${config.APP_NAME}" <${config.SUPPORT_EMAIL}>`,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html,
        attachments: options.attachments,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${options.to}: ${options.subject}`);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Generate HTML template
  private generateTemplate(template: string, data: Record<string, any>): string {
    const templates: Record<string, string> = {
      welcome: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${config.APP_NAME}! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name},</h2>
              <p>Thank you for joining ${config.APP_NAME}! We're excited to have you on board.</p>
              
              <p>Your account has been successfully created. Here are your next steps:</p>
              <ul>
                <li>Complete your profile to build trust with other users</li>
                <li>Verify your email address</li>
                <li>Set up two-factor authentication for added security</li>
                <li>Explore auctions and start trading precious metals</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${config.APP_URL}/dashboard" class="button">Go to Dashboard</a>
              </div>
              
              <p>If you have any questions, please don't hesitate to contact our support team.</p>
              
              <p>Best regards,<br>The ${config.APP_NAME} Team</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ${config.APP_NAME}. All rights reserved.</p>
              <p><a href="${config.APP_URL}/privacy">Privacy Policy</a> | <a href="${config.APP_URL}/terms">Terms of Service</a></p>
            </div>
          </div>
        </body>
        </html>
      `,

      auctionWon: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .auction-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4CAF50; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Auction Won! 🎉</h1>
            </div>
            <div class="content">
              <h2>Congratulations ${data.buyerName}!</h2>
              <p>You have successfully won the auction for:</p>
              
              <div class="auction-details">
                <h3>${data.auctionTitle}</h3>
                <p><strong>Final Bid:</strong> ${data.currency} ${data.winningBid}</p>
                <p><strong>Metal:</strong> ${data.metalType} ${data.metalForm}</p>
                <p><strong>Weight:</strong> ${data.weight} oz</p>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Complete the payment within 24 hours</li>
                <li>Wait for seller to confirm receipt</li>
                <li>Track your shipment</li>
                <li>Leave a review after receiving your item</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${config.APP_URL}/transactions/${data.transactionId}" class="button">Complete Payment</a>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>The ${config.APP_NAME} Team</p>
            </div>
          </div>
        </body>
        </html>
      `,

      passwordReset: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { font-size: 32px; letter-spacing: 10px; text-align: center; margin: 30px 0; font-weight: bold; color: #ff6b6b; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.name},</h2>
              <p>We received a request to reset your password for your ${config.APP_NAME} account.</p>
              
              <p>Use the following code to reset your password:</p>
              
              <div class="code">${data.resetCode}</div>
              
              <div class="warning">
                <p><strong>⚠️ Important:</strong> This code will expire in 1 hour.</p>
                <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${config.APP_URL}/reset-password?code=${data.resetCode}" class="button">Reset Password</a>
              </div>
              
              <p>Best regards,<br>The ${config.APP_NAME} Security Team</p>
            </div>
          </div>
        </body>
        </html>
      `,

      kycApproved: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>KYC Verification Approved! ✅</h1>
            </div>
            <div class="content">
              <h2>Congratulations ${data.name}!</h2>
              
              <div class="success">
                <p><strong>🎉 Your KYC verification has been approved!</strong></p>
                <p>You now have full access to all features of ${config.APP_NAME}.</p>
              </div>
              
              <p><strong>Benefits of being verified:</strong></p>
              <ul>
                <li>Higher transaction limits</li>
                <li>Access to premium auctions</li>
                <li>Increased trust from other users</li>
                <li>Priority support</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${config.APP_URL}/dashboard" class="button">Start Trading</a>
              </div>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>The ${config.APP_NAME} Compliance Team</p>
            </div>
          </div>
        </body>
        </html>
      `,

      disputeOpened: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ffa502 0%, #ff7f00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .dispute-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffa502; }
            .button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #ffa502 0%, #ff7f00 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Dispute Opened ⚖️</h1>
            </div>
            <div class="content">
              <h2>Hello ${data.userName},</h2>
              <p>A dispute has been opened for transaction: <strong>${data.transactionId}</strong></p>
              
              <div class="dispute-info">
                <p><strong>Reason:</strong> ${data.disputeReason}</p>
                <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
                <p><strong>Opened by:</strong> ${data.openedBy}</p>
                <p><strong>Reference:</strong> ${data.disputeId}</p>
              </div>
              
              <p><strong>What happens next:</strong></p>
              <ol>
                <li>Our moderation team will review the dispute (usually within 48 hours)</li>
                <li>You may be asked to provide additional information or evidence</li>
                <li>A resolution will be proposed based on our policies</li>
                <li>Funds will be released according to the resolution</li>
              </ol>
              
              <div style="text-align: center;">
                <a href="${config.APP_URL}/disputes/${data.disputeId}" class="button">View Dispute Details</a>
              </div>
              
              <p>Please respond promptly to any requests from our moderation team.</p>
              
              <p>Best regards,<br>The ${config.APP_NAME} Dispute Resolution Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    return templates[template] || `<p>${JSON.stringify(data)}</p>`;
  }

  // Send welcome email
  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Welcome to ${config.APP_NAME}!`,
      template: 'welcome',
      data: { name },
    });
  }

  // Send auction won email
  async sendAuctionWonEmail(
    to: string,
    buyerName: string,
    auctionTitle: string,
    winningBid: number,
    currency: string,
    metalType: string,
    metalForm: string,
    weight: number,
    transactionId: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `🎉 Congratulations! You won an auction!`,
      template: 'auctionWon',
      data: {
        buyerName,
        auctionTitle,
        winningBid,
        currency,
        metalType,
        metalForm,
        weight,
        transactionId,
      },
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(to: string, name: string, resetCode: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Password Reset Request - ${config.APP_NAME}`,
      template: 'passwordReset',
      data: { name, resetCode },
    });
  }

  // Send KYC approval email
  async sendKYCApprovedEmail(to: string, name: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `✅ KYC Verification Approved - ${config.APP_NAME}`,
      template: 'kycApproved',
      data: { name },
    });
  }

  // Send dispute opened email
  async sendDisputeOpenedEmail(
    to: string,
    userName: string,
    transactionId: string,
    disputeId: string,
    disputeReason: string,
    amount: number,
    currency: string,
    openedBy: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `⚠️ Dispute Opened - ${config.APP_NAME}`,
      template: 'disputeOpened',
      data: {
        userName,
        transactionId,
        disputeId,
        disputeReason,
        amount,
        currency,
        openedBy,
      },
    });
  }

  // Send 2FA code email
  async send2FACodeEmail(to: string, name: string, code: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `Your Two-Factor Authentication Code - ${config.APP_NAME}`,
      template: 'passwordReset', // Reuse password reset template
      data: { name, resetCode: code },
    });
  }

  // Send payment received email
  async sendPaymentReceivedEmail(
    to: string,
    sellerName: string,
    amount: number,
    currency: string,
    transactionId: string,
    buyerName: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `💰 Payment Received - ${config.APP_NAME}`,
      template: 'auctionWon', // Similar template
      data: {
        buyerName: sellerName,
        auctionTitle: 'Payment Received',
        winningBid: amount,
        currency,
        transactionId,
        metalType: 'Payment',
        metalForm: 'Transaction',
        weight: 0,
      },
    });
  }

  // Send shipping update email
  async sendShippingUpdateEmail(
    to: string,
    userName: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery: string,
    auctionTitle: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: `📦 Shipping Update - Your ${config.APP_NAME} Order`,
      template: 'welcome', // Generic template
      data: {
        name: userName,
        trackingNumber,
        carrier,
        estimatedDelivery,
        auctionTitle,
      },
    });
  }

  // Test email service
  async testEmail(): Promise<boolean> {
    return this.sendEmail({
      to: config.SUPPORT_EMAIL,
      subject: `Test Email - ${config.APP_NAME}`,
      template: 'welcome',
      data: { name: 'Test User' },
    });
  }
}

// Create singleton instance
export const emailService = new EmailService();
