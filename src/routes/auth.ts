import { Router } from "express";
import { login, logout, register, verifyAccount, forgotPassword, resetPassword, resendVerificationLink } from "../controllers/authController";
import { requireCookie } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-account", verifyAccount);
router.post("/forgot-password", forgotPassword);
router.post("/resend-verification-link", resendVerificationLink);
router.post("/reset-password", resetPassword);
router.post("/logout", requireCookie, logout);

export default router;
