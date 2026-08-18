import { Request, Response } from "express";
import Bid from "../models/Project/Bid";
import logger from "../utils/logger";

class BidService {
  constructor() {}

  async getProjectBids(req: Request, res: Response) {
    const { project_id } = req.params;

    if (!project_id) {
      res.status(400).json({
        status: "bad request",
        message: "No project id associated",
      });
    }

    try {
      const project_bids = await Bid.find({ _id: project_id });

      res.status(200).json({
        status: "success ok",
        message: "",
        bids: project_bids,
      });
    } catch (error) {
      logger.error("internal server error", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async getAllBids(req: Request, res: Response) {
    const { page, size } = req.query;

    try {
      const bids = await Bid.find().limit(Number(size) ?? 15);

      res.status(200).json({
        status: "success ok",
        message: "",
        bids: bids,
      });
    } catch (error) {
      logger.error("", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async getUserBids(req: Request, res: Response) {
    const { page, size } = req.query;

    if (!req.params.uid) {
      res.status(404).json({
        status: "user not found",
        message: "No bid found",
      });
    }

    try {
      const bids = await Bid
        .find({ _id: req.params.id })
        .limit(Number(size) ?? 15);

      res.status(200).json({
        status: "success ok",
        message: "",
        bids: bids,
      });
    } catch (error) {
      logger.error("[BID SERVICE] failed to retrieve user bids", error);
      res.status(500).send({
        status: "internal server error",
        error: error,
      });
    }
  }

  async createBid(req: Request, res: Response) {
    try {
      const newbid = new Bid();

      newbid.executiveSummary = req.body.executiveSummary;
      newbid.coverLetter = req.body.coverLetter;
      newbid.teamComposition = req.body.teamComposition ?? [];
      newbid.bidder = req.body.bidder;
      newbid.project = req.body.project;

      await newbid.save();

      res.status(200).json({
        status: "success ok",
        message: "",
        bid: newbid,
      });
    } catch (error) {
      logger.error("[BID SERVICE] ", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async updateBid(req: Request, res: Response) {
    try {
      const updated = await Bid.findByIdAndUpdate(
        req.body.id,
        { ...req.body },
        { new: true, upsert: true },
      );

      res.status(200).json({
        status: "success ok",
        message: "",
        bid: updated,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ status: "internal server error", error: error });
    }
  }
}

export default new BidService();
