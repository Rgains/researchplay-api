import { Request, Response } from "express";
import AuthService from "../services/auth.service";

export async function createAdmin(req: Request, res: Response) {
  return await AuthService.createAdmin(req, res);
}

export async function register(req: Request, res: Response) {
  return await AuthService.register(req, res);
}

export async function login(req: Request, res: Response) {
  return await AuthService.login(req, res);
}

export async function logout(req: Request, res: Response) {
  return await AuthService.logout(req, res);
}

export async function forgotPassword(req: Request, res: Response) {
  return await AuthService.forgotPassword(req, res);
}

export async function resetPassword(req: Request, res: Response) {
  return await AuthService.resetPassword(req, res);
}

export async function verifyAccount(req: Request, res: Response) {
  return await AuthService.verifyAccount(req, res);
}

export async function resendVerificationLink(req: Request, res: Response) {
  return await AuthService.resendVerificationLink(req, res);
}