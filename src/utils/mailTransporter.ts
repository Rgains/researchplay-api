import nodemailer from 'nodemailer';
import { currentConfig } from './config';

export const testMailAccount = nodemailer.createTestAccount();

export const transporter = nodemailer.createTransport({
  host: currentConfig.mailHost,
  service: 'gmail',
  // port: Number(currentConfig.mailPort),
  // secure: true,
  auth: {
    user: currentConfig.mailUser,
    pass: currentConfig.mailPassword,
  },
});