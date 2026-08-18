import { Transporter } from 'nodemailer';
import { testMailAccount, transporter } from '../utils/mailTransporter';
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

    async SendWithResend(data: any) {
        this.resend.emails.send({
            from: currentConfig.mailUser,
            to: (await testMailAccount).user ,
            text: data.text,
            subject: data.subject
        });
    }

    async sendVerificationTokenMail(code: string, token: string, recipient?: string) {
        return this.transporter.sendMail({
            from: currentConfig.mailUser,
            to: recipient ?? currentConfig.mailUser,
            subject: `Verification Code`,
            html: `<p>Here is your verification code, ${code}.</p> 
            <p>Click the link to verify your account 
            <a href="http://localhost:4200/auth/otp-verification?token=${token}">
            http://localhost:4200/auth/otp-verification?token=${token}</a></p>`
        });
    }
}

export default new MailService(transporter);