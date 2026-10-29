import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  try {
    // Determine the transporter configuration
    // Using Gmail SMTP based on user preference
    let transporter;

    if (process.env.GMAIL_EMAIL && process.env.GMAIL_APP_PASSWORD) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_EMAIL,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
    } else {
      // Fallback for local development or if credentials aren't set
      console.warn('⚠️ No valid GMAIL_EMAIL or GMAIL_APP_PASSWORD found in .env. Using mock email delivery (console only).');
      transporter = {
        sendMail: async (mailOptions) => {
          console.log('\n==================================================');
          console.log(`[MOCK EMAIL DISPATCH] -> To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`\n${mailOptions.text || mailOptions.html}`);
          console.log('==================================================\n');
          return { messageId: 'mock-id' };
        }
      };
    }

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'NEXORA Platform'} <${process.env.EMAIL_FROM || 'noreply@nexora.io'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html // Optional HTML support
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email} (Message ID: ${info.messageId})`);
    return info;

  } catch (error) {
    console.error(`Failed to send email to ${options.email}:`, error);
    throw new Error('Email could not be sent');
  }
};
