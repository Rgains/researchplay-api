import { Router } from "express";
import {
  createBid,
  fetchAllBids,
  fetchUserBids,
  updateBid,
} from "../controllers/bidController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/:uid", requireAuth, fetchUserBids);
router.get("", requireAuth, fetchAllBids);
router.post("", requireAuth, createBid);
router.put("", requireAuth, updateBid);

export default router;
