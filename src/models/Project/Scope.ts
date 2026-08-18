import mongoose from "mongoose";

const ScopeSchema = new mongoose.Schema({
  expectedDeliverables: { type: String },
  geographicCoverage: {},
  dataCollectionMethod: { type: String },
  targetPopulation: { type: String },
  sampleSize: { type: Number },
  requiredMethodology: { type: [String] },
  analysisRequirements: { type: [String] },
  reportingRequirements: { type: [String] },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "project" },
});

const scope = mongoose.model("scopes", ScopeSchema);

export default scope;
