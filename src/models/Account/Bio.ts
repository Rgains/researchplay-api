import mongoose from "mongoose";

const BioSchema = new mongoose.Schema({
  biography: { type: String },
  birthDate: { type: String },
  birthMonth: { type: String },
  nationality: { type: String },
  interests: { type: [String] },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

const bio = mongoose.model("bio", BioSchema);

export default bio;
