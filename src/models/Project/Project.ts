import mongoose from "mongoose";
import { ProjectStatus } from "../../types";

const projectStatus: ProjectStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "IN_PROGRESS",
  "IN_REVIEW",
  "AWARDED",
  "CANCELLED",
  "COMPLETED",
];

const ProjectSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, required: true },
  researchCategories: { type: [String] },
  researchType: { type: String },
  researchField: { type: [String] },
  projectSummary: { type: String },
  projectDescription: { type: String },
  objectives: { type: [String] },
  researchQuestions: { type: [String] },
  hypothesis: { type: String },
  keywords: { type: [String] },
  budget: { type: mongoose.Schema.Types.ObjectId, ref: "budget" },
  awardee: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  // duration: { type: mongoose.Schema.Types.ObjectId, ref: "duration" },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  status: {
    type: String,
    required: true,
    enum: projectStatus,
    default: projectStatus[0],
  },
});

const Project = mongoose.model("projects", ProjectSchema);

export default Project;
