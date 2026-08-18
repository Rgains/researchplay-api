import { Request, Response } from "express";
import Budget from "../models/Project/Budget";
import Project from "../models/Project/Project";
import logger from "../utils/logger";
import { stat } from "fs";

class BudgetService {
    constructor() {}

    async getBudget(req: Request, res: Response) {
        if(!req.params.budget_id) {
            logger.warn("");
            return res.status(400).json({
                status: 400,
                message: "Budget not found"
            });
        }

        try {
            const budget = await Budget.findById(req.params.budget_id);

            if(!budget) {
                logger.info("");
            }

            logger.info("");
            res.status(200).json({
                status: "success ok",
                message: "",
                budget: budget
            });
        } catch(error){
            logger.error("[BUDGET SERVICE] Failed to retrieve budget", error);
            res.status(500).json({
                status: "internal server error",
                error: error
            });
        }
    }

    async getUserBudgets(req: Request, res: Response) {
        const user_id = req.query.uid;

        if(!user_id) {
            return res.status(404).json({
                status: 404,
                message: "user not found!"
            })
        }

        try {
            const myBudget = await Budget.find({ where: { user: user_id! }});
        
            logger.info("[BUDGET SERVICE] Retrieved user budgets successfully.");
            res.status(200).json({ status: "success ok", budgets: myBudget });
        } catch (error) {
            logger.error("[BUDGET SERVICE] Failed to retrieve user budgets.", error);
            res.status(500).json({
                status: "internal server error",
                error: error
            });
        }
    }

    async createBudget(req: Request, res: Response) {
        const { type, name, amount, currency, milestones, terms, user, project_id } = req.body;

        if (!type || !name || !amount || !currency || !user) {
            res.status(400).json({
            status: "400",
            message: "Kindly provide the following type, name, amount and currency",
            });
        }

        try {
            const newBudget = new Budget();

            newBudget.type = type;
            newBudget.name = name;
            newBudget.amount = amount;
            newBudget.currency = currency;

            if (milestones && milestones.length > 0) {
            milestones.forEach((milestone: any) => {
                newBudget.milestones.push(milestone);
            });
            }

            if (terms) newBudget.terms = terms;

            const savedBudget = await newBudget.save();

            if(project_id) {
            await Project.findByIdAndUpdate(
                project_id, 
                { budget: savedBudget._id }, 
                { new: true, upsert: true }
            );
            }

            res
            .status(200)
            .json({ status: "success ok", message: "", budget: savedBudget });
        } catch (error) {
            logger.error("[BUDGET SERVICE] Failed to create budget.", error);
            res.status(500).json({
                status: "internal server error",
                error: error
            });
        }
    }

    async updateBudget(req: Request, res: Response) {
        const {} = req.body;

        try {
        } catch (error) {}
    }

    async deleteBudget(req: Request, res: Response) {
        const budget_id = req.params.budget_id;

        if(!budget_id) {
            return res.status(404).json({
                status: 404,
                message: "Budget not found!"
            });
        }

        try {
            const deleted_budget = await Budget.findByIdAndDelete(budget_id);

            logger.info("[BUDGET SERVICE] Budget deleted successfully.", deleted_budget?._id);
            return res.status(200).json({
                status: "success ok",
                message: "budget deleted successfully"
            });
        } catch (error) {
            logger.error("[BUDGET SERVICE] Failed to delete user budget.", error);
            res.status(500).json({
                status: "internal server error",
                error: error
            });
        }
    }
}

export default new BudgetService;