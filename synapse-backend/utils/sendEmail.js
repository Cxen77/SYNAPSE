import nodemailer from 'nodemailer';

// Reusable transporter (created once, not per-request)
let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            },
            // CRITICAL: Prevent hanging on bad credentials
            connectionTimeout: 10000, // 10 seconds to connect
            greetingTimeout: 10000,   // 10 seconds for greeting
            socketTimeout: 15000      // 15 seconds for socket
        });
    }
    return transporter;
};

const sendEmail = async (options) => {
    const message = {
        from: `Fuseon Team <${process.env.EMAIL_USER}>`,
        to: options.email,
        replyTo: process.env.EMAIL_USER,
        subject: options.subject,
        text: options.message,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <h2 style="color: #2563EB;">Fuseon</h2>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="font-size: 16px; line-height: 1.5;">${options.message.replace(/\n/g, '<br>')}</p>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                    <p>You're receiving this email because you recently requested a verification code or password reset for your Fuseon account.</p>
                    <p>If this wasn't you, please ignore this email.</p>
                    <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Fuseon. All rights reserved.</p>
                </div>
            </div>
        `
    };

    await getTransporter().sendMail(message);
};

/**
 * Fire-and-forget email: sends in background, never blocks the caller.
 * Logs errors but doesn't throw.
 */
export const sendEmailAsync = (options) => {
    sendEmail(options).catch(err => {
        console.error('Background email send failed:', err.message);
    });
};

export default sendEmail;
