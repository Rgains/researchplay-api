import { config } from "dotenv";

config();

const env: string = process.env.NODE_ENV!;

const env_config: any = {
    production: {
        env: env,
        port: process.env.PORT,
        mongoUri: process.env.MONGO_URI,
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        verificationSecret: process.env.VERIFICATION_TOKEN_SECRET,
        salt: parseInt(process.env.SALT!) ?? 10,
        mailHost: process.env.MAIL_HOST,
        mailPort: process.env.MAIL_PORT,
        mailUser: process.env.MAIL_USER,
        mailPassword: process.env.MAIL_PASSWORD,
        resendKey: process.env.RESEND_KEY,
    },
    development: {
        env: env,
        port: process.env.PORT,
        mongoUri: process.env.MONGO_URI,
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        verificationSecret: process.env.VERIFICATION_TOKEN_SECRET,
        salt: parseInt(process.env.SALT!) ?? 10,
        mailHost: process.env.MAIL_HOST,
        mailPort: process.env.MAIL_PORT,
        mailUser: process.env.MAIL_USER,
        mailPassword: process.env.MAIL_PASSWORD,
        resendKey: process.env.RESEND_KEY,
    }
}

export const currentConfig = env_config[env];
