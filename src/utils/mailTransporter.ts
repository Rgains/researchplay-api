import nodemailer from 'nodemailer';
import { currentConfig } from './config';

export const transporter = nodemailer.createTransport({
  host: currentConfig.mailHost,
  port: currentConfig.mailPort,
  secure: true,
  auth: {
    user: currentConfig.mailUser,
    pass: currentConfig.mailPassword,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});