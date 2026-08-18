import { Router } from "express";
import { saveAcctTypes } from "../controllers/onboardingController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("save_acct_types", requireAuth, saveAcctTypes);

export default router;