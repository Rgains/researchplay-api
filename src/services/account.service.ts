import { Request, Response } from "express";
import logger from "../utils/logger";
import bio from "../models/Account/Bio";
import contact from "../models/Account/Contact";
import User from "../models/Account/User";
import Institute from "../models/Institution/Institute";
import { acctTypes } from "../types";

class AccountService {
  constructor() {}

  async getLoggedInAccount(req: Request, res: Response) {
    const user_id = req.body.user.id;
    const roles: string[] = req.body.user.acctTypes;

    try {
      const acct = await User.findById(user_id)
        .lean()
        .select('-password');
        

      res.status(200).json({
        status: 'success ok',
        data: acct
      });
    } catch(error) {
      logger.error("[ACCOUNT_SERVICE] failed to fetch logged in acct: Line 13", error);
      return res.status(500).json({
        status: "internal server error",
        error: error
      });
    }
  }

  async getBio(id: string, res: Response) {
    try {
      const myBio = bio.findById(id);

      res.status(200).json({
        status: "success ok",
        bio: myBio,
      });
    } catch (error) {
      logger.error("[ACCOUNT SERVICE] failed to retrieve bio", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async createBio(req: Request, res: Response) {
    try {
      const newBio = new bio();

      newBio.interests = req.body.interests;
      newBio.biography = req.body.biography;
      newBio.birthDate = req.body.birthdate;
      newBio.birthMonth = req.body.birthMonth;
      newBio.nationality = req.body.nationality;
      newBio.user = req.body.user_id;

      await newBio.save();

      logger.error("[ACCOUNT SERVICE] bio created successfully", newBio);
      res.status(201).json({
        status: "success ok",
        message: "bio saved successfully",
        bio: newBio,
      });
    } catch (error) {
      logger.error("[ACCOUNT SERVICE] failed to create bio", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async updateBio(id: string, req: Request, res: Response) {
    try {
      const updated_bio = await bio.findByIdAndUpdate(id, ...req.body, {
        upsert: true,
        new: true,
      });

      res.status(200).json({
        status: "success ok",
        bio: updated_bio,
      });
    } catch (error) {
      logger.error("[ACCOUNT SERVICE] failed to update bio", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async getContact(id: string, res: Response) {
    try {
      const contacts = await contact.findById(id);

      logger.error(
        "[ACCOUNT SERVICE] contact retrieved successfully",
        contacts,
      );

      res.status(200).json({
        status: "success ok",
        message: "contact saved successfully",
        contact: contacts,
      });
    } catch (error) {
      logger.error("[ACCOUNT SERVICE] failed to retrieve contact", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async createContact(req: Request, res: Response) {
    try {
      const newContact = new contact();

      if (req.body.telephoneOne)
        newContact.telephoneOne = req.body.telephoneOne;
      if (req.body.telephoneTwo)
        newContact.telephoneTwo = req.body.telephoneTwo;

      await newContact.save();

      logger.error(
        "[ACCOUNT SERVICE] contact created successfully",
        newContact,
      );
      res.status(201).json({
        status: "success ok",
        message: "",
        contact: newContact,
      });
    } catch (error) {
      logger.error("[ACCOUNT SERVICE] failed to create contact", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }

  async updateContact(id: string, req: Request, res: Response) {
    try {
      const updated_contact = await contact.findByIdAndUpdate(id, ...req.body, {
        new: true,
        upsert: true,
      });

      logger.error(
        "[ACCOUNT SERVICE] contact updated successfully",
        updated_contact,
      );

      res.status(200).json({
        status: "success ok",
        message: "",
        contact: updated_contact,
      });
    } catch (error) {
      logger.error("[ACCOUNT SERVICE] failed to update contact", error);
      res.status(500).json({
        status: "internal server error",
        error: error,
      });
    }
  }
}

export const accountService = new AccountService();
