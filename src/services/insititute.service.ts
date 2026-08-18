import { Request, Response } from "express";
import logger from "../utils/logger";
import Institute from "../models/Institution/Institute";

class InstituteService {
  constructor() {}

  async getInstitutions(req: Request, res: Response) {
    try {
      const institute = await Institute.find();

      logger.info("", institute);
    } catch (error) {
      logger.error("[INSTITUTE SERVICE] failed to retrieve institute", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async saveInstitute(req: Request, res: Response) {
    try {
      const institution = new Institute();

      institution.institutionName = req.body.name;

      await institution.save();

      logger.error(
        "[INSTITUTE SERVICE] institute created successfully",
        institution,
      );
      res.status(200).json({
        status: "success ok",
        message: "",
        institution: institution,
      });
    } catch (error) {
      logger.error("[INSTITUTE SERVICE] failed to create institute", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async updateInstitute(req: Request, res: Response) {
    try {
      const institution = await Institute.findByIdAndUpdate(
        req.params.id,
        ...req.body,
        { new: true, upsert: true },
      );

      logger.error(
        "[INSTITUTE SERVICE] institute updated successfully",
        institution,
      );
      res.status(200).json({
        status: "",
        message: "",
        institution: institution,
      });
    } catch (error) {
      logger.error("[INSTITUTE SERVICE] failed to update institute", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async deleteInstitute(req: Request, res: Response) {
    try {
      const institution = await Institute.findByIdAndDelete(req.params.id);

      logger.error(
        "[INSTITUTE SERVICE] institute deleted successfully",
        institution,
      );
      res.status(200).json({
        status: "success ok",
        message: "",
        institution: institution,
      });
    } catch (error) {
      logger.error("[INSTITUTE SERVICE] failed to delete institute", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }
}

export default new InstituteService();
