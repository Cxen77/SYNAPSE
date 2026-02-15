import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // 1) Create a transporter
    // Improved settings for Gmail deliverability
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // 2) Define email content with both Text and HTML
    const message = {
        from: `Fuseon Team <${process.env.EMAIL_USER}>`, // Professional "From"
        to: options.email,
        replyTo: process.env.EMAIL_USER, // Professional "Reply-To"
        subject: options.subject,
        text: options.message, // Plain text version for spam filters
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                <h2 style="color: #2563EB;">Fuseon</h2>
                <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="font-size: 16px; line-height: 1.5;">${options.message.replace(/\n/g, '<br>')}</p>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px;">
                    <p>You’re receiving this email because you recently requested a verification code or password reset for your Fuseon account.</p>
                    <p>If this wasn’t you, please ignore this email.</p>
                    <p style="margin-top: 10px;">&copy; ${new Date().getFullYear()} Fuseon. All rights reserved.</p>
                </div>
            </div>
        `
    };

    // 3) Actually send the email
    await transporter.sendMail(message);
};

export default sendEmail;
