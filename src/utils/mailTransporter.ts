import nodemailer from 'nodemailer';
import { currentConfig } from './config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const transporter = nodemailer.createTransport({
  host: currentConfig.mailHost,
  port: currentConfig.mailPort,
  secure: false,
  auth: {
    user: currentConfig.mailUser,
    pass: currentConfig.mailPassword,
  },
  family: 4,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
} as SMTPTransport.Options);