import crypto from 'crypto';
import { currentConfig } from "./config";
import Jwt from "jsonwebtoken";

export function generateAccessToken(payload: any, period?: any) {
    return Jwt.sign(payload, currentConfig.accessTokenSecret, {
        expiresIn: period ?? '2h'
    });
}

export function generateRefreshToken(payload: any, period?: any) {
    return Jwt.sign(payload, currentConfig.accessTokenSecret, {
        expiresIn: period ?? '2d'
    });
}

export function generateAcctVerificationToken(payload: any, period?: any) {
    return Jwt.sign(payload, currentConfig.verificationSecret, {
         expiresIn: period ?? '1d' 
    });
}

export function generatePasswordResetToken(payload: any, period?: any) {
    return Jwt.sign(payload, currentConfig.passwordResetSecret, {
        expiresIn: period ?? '1d'
    });
}

export function generateVerificationCode() {
    return crypto.randomInt(100000, 1000000).toString();
}