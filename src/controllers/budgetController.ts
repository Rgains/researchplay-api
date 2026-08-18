import { Response, Request } from "express";
import BudgetService from "../services/budget.service";

export async function getBudget(req: Request, res: Response) {
  return await BudgetService.getBudget(req, res);
}

export async function userBudgets(req: Request, res: Response) {
  return await BudgetService.getUserBudgets(req, res);
}

export async function createBudget(req: Request, res: Response) {
  return await BudgetService.createBudget(req, res);
}

export async function updateBudget(req: Request, res: Response) {
  return await BudgetService.updateBudget(req, res);
}

export async function deleteBudget(req: Request, res: Response) {
  return await BudgetService.deleteBudget(req, res);
}
