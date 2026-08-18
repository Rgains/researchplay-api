import mongoose from "mongoose";
import { BudgetType } from "../../types";

const budgetTypes: BudgetType[] = ["FIXED", "NEGOTIABLE"];

const BudgetSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: budgetTypes,
    default: budgetTypes[0],
  },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  milestones: [
    {
      amount: { type: String, required: true },
      milestone: { type: String, required: true },
    },
  ],
  terms: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

const Budget = mongoose.model("budgets", BudgetSchema);

export default Budget;
