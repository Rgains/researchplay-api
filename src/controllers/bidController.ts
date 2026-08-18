import { Request, Response } from "express";
import BidService from "../services/bid.service";

export async function fetchAllBids(req: Request, res: Response) {
  return await BidService.getAllBids(req, res);
}

export async function fetchUserBids(req: Request, res: Response) {
  return await BidService.getUserBids(req, res);
}

export async function fetchProjectBids(req: Request, res: Response) {
  return await BidService.getProjectBids(req, res);
}

export async function createBid(req: Request, res: Response) {
  return await BidService.createBid(req, res);
}

export async function updateBid(req: Request, res: Response) {
  return await BidService.updateBid(req, res);
}
