import { Transporter } from 'nodemailer';
import { transporter } from '../utils/mailTransporter';
import { MailObject } from '../types';
import { Resend } from 'resend';
import { currentConfig } from '../utils/config';

class MailService {
    private transporter: Transporter;

    private resend = new Resend(currentConfig.resendKey);

    constructor(transporter: Transporter) {
        this.transporter = transporter;
    }

    async sendMail(data: MailObject) {
        return await this.transporter.sendMail({
            from: currentConfig.mailUser,
            to: data.to,
            subject: data.subject,
            html: data.text
        });
    }

    async SendWithResend(data: any, recipient?: string) {
        this.resend.emails.send({
            from: currentConfig.mailUser,
            to: recipient ?? currentConfig.mailUser,
            text: data.text,
            subject: data.subject
        });
    }

    async sendVerificationTokenMail(code: string, token: string, recipient?: string) {
        this.resend.emails.send({
            from: `ResearchPlay <okoisorjr@gmail.com>`,
            to: recipient ?? currentConfig.mailUser,
            subject: `Verification Code`,
            html: `<p>Here is your verification code, <strong>${code}.</strong></p> 
            <p>Click the link to verify your account 
            <a href="${currentConfig.frontendUrl}/auth/otp-verification?token=${token}">
            ${currentConfig.frontendUrl}/auth/otp-verification?token=${token}</a></p>`
        });
        
    }
}

export default new MailService(transporter);