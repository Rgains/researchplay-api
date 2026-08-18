import { Router } from "express";
import { 
    getBudget, 
    createBudget, 
    userBudgets, 
    updateBudget, 
    deleteBudget 
} from "../controllers/budgetController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("", requireAuth, userBudgets);
router.get(":budget_id", requireAuth, getBudget);
router.post("", requireAuth, createBudget);
router.put("", requireAuth, updateBudget);
router.delete(":budget_id", requireAuth, deleteBudget);

export default router;
