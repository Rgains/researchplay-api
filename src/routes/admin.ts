import { requireAdmin, requireAuth } from "../middleware/auth";
import { Router } from "express";
import { allProjects, getProject } from "../controllers/projectControllers";
import { createAdmin } from "../controllers/authController";
import { fetchAllBids } from "../controllers/bidController";

const router = Router();

router.get("/bids", requireAuth, requireAdmin(), fetchAllBids);
router.get(
  "/projects/:project_id/view",
  requireAuth,
  requireAdmin(),
  getProject,
);
router.get("/projects/list", requireAuth, requireAdmin(), allProjects);
router.post("/create-admin", createAdmin);

export default router;
