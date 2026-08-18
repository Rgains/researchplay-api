import { Request, Response } from "express";
import OnboardingService from "../services/onboarding.service";

export const saveAcctTypes = async (req: Request, res: Response) => {
    return await OnboardingService.saveAcctTypes(req, res);
}