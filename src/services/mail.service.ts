import { Transporter } from 'nodemailer';
import { transporter } from '../utils/mailTransporter';
import { MailObject } from '../types';
import { Resend } from 'resend';
import { currentConfig } from '../utils/config';
import logger from '../utils/logger';

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
        try{
            const {data, error} = await this.resend.emails.send({
                from: `ResearchPlay <${currentConfig.senderEmail}>`,
                to: recipient ?? currentConfig.mailUser,
                subject: `Verification Code`,
                html: `<p>Here is your verification code, <strong>${code}.</strong></p> 
                <p>Click the link to verify your account 
                <a href="${currentConfig.frontendUrl}/auth/otp-verification?token=${token}">
                ${currentConfig.frontendUrl}/auth/otp-verification?token=${token}</a></p>`
            });
            
            if(error) {
                return;
            }
            logger.info('[Mail Service] verification token sent successfully to: ', recipient);
            return;
        } catch(error: any) {
            logger.info('[Mail Service] Failed to send verification token');
            return;
        }
    }

    async sendPasswordResetLinkMail(token: string, recipient?: string) {
        try{
            const {data, error} = await this.resend.emails.send({
                from: `ResearchPlay <${currentConfig.senderEmail}>`,
                to: recipient ?? currentConfig.mailUser,
                subject: `Password Reset`,
                html: `<p>Click the link to reset your password. 
                <a href="${currentConfig.frontendUrl}/auth/reset-password?token=${token}">
                ${currentConfig.frontendUrl}/auth/reset-password?token=${token}</a></p>`
            });
            
            if(error) {
                return;
            }
            logger.info('[Mail Service] verification token sent successfully to: ', recipient);
            return;
        } catch(error: any) {
            logger.info('[Mail Service] Failed to send verification token');
            return;
        }
    }
}

export default new MailService(transporter);