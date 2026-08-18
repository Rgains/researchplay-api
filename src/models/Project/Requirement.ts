import mongoose from "mongoose";

const RequirementSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "project" },
});

const requirement = mongoose.model("requirements", RequirementSchema);

export default requirement;
