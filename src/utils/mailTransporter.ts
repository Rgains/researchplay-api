import nodemailer from 'nodemailer';
import { currentConfig } from './config';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: currentConfig.mailUser,
    pass: currentConfig.mailPassword,
  },
});