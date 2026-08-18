import { Request, Response } from "express";
import User from "../models/Account/User";
import logger from "../utils/logger";

class OnboardingService {
    constructor() {}

    async saveAcctTypes(req: Request, res: Response) {
        try {
            const user = await User.findByIdAndUpdate(
                req.body.user_id, 
                req.body, 
                { new: true, upsert: true }
            );

            return res.status(200).json({
                status: "success ok",
                message: "Preference Saved!",
                data: user
            });
        } catch(error) {
            logger.error("", error);
            res.status(500).json({
                status: "internal server error",
                error: error
            });
        }
    }

    async saveBio(req: Request, res: Response) {

    }

    async saveContact() {

    }

    async saveBudget() {

    }
}

export default new OnboardingService();