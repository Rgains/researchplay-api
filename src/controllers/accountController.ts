import { Request, Response } from "express";
import { accountService } from "../services/account.service";
import authService from "../services/auth.service";

export async function fetchUserAccount (req: Request, res: Response) {
  return await accountService.getLoggedInAccount(req, res);
}

export async function fetchBio(req: Request, res: Response) {
  return await accountService.getBio(req.params.uid!, res);
}

export async function createBio(req: Request, res: Response) {
  return await accountService.createBio(req, res);
}

export async function updateBio(req: Request, res: Response) {
  return await accountService.updateBio(req.params.id!, req, res);
}

export async function fetchContact(req: Request, res: Response) {
  return await accountService.getContact(req.params.id!, res);
}

export async function createContact(req: Request, res: Response) {
  return await accountService.createContact(req, res);
}

export async function updateContact(req: Request, res: Response) {
  return await accountService.updateContact(req.params.uid!, req, res);
}
