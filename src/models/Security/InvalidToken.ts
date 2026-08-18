import mongoose from "mongoose";

const InvalidatedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  expired: { type: Boolean },
  invalidationMethod: { type: String, required: true },
});

const invalidToken = mongoose.model("invalidTokens", InvalidatedTokenSchema);

export default invalidToken;
