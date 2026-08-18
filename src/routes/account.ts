import { Router } from "express";
import {
  createBio,
  createContact,
  fetchBio,
  fetchUserAccount,
  fetchContact,
  updateBio,
  updateContact,
} from "../controllers/accountController";
import { requireCookie } from "../middleware/auth";

const router = Router();

router.get("", requireCookie, fetchUserAccount);
router.get("/bio", requireCookie, fetchBio);
router.get("/contact", requireCookie, fetchContact);
router.post("/bio", requireCookie, createBio);
router.post("/contact", requireCookie, createContact);
router.put("/bio", requireCookie, updateBio);
router.put("/contact", requireCookie, updateContact);

export default router;
