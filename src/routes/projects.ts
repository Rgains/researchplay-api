import { Router } from "express";
import { requireCookie, requirePermission } from "../middleware/auth";
import {
  userProjects,
  createProject,
  updateProject,
  getProject,
} from "../controllers/projectControllers";
import { fetchProjectBids } from "../controllers/bidController";

const router = Router();

router.get("/", requireCookie, userProjects);
router.get("/:project_id/project", requireCookie, requirePermission, getProject);
router.get("/:project_id/bids", requireCookie, fetchProjectBids);
router.post("/new", requireCookie, createProject);
router.put("", requireCookie, updateProject);

export default router;
