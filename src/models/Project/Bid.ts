import mongoose from "mongoose";

const BidSchema = new mongoose.Schema({
  coverLetter: { type: String },
  executiveSummary: { type: String },
  teamComposition: { type: [String] },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "" },
  bidder: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  comments: [
    {
      message: { type: String, required: true },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    },
  ],
  status: { type: String, required: true, default: "IN_REVIEW" }, 
});

const Bid = mongoose.model("bids", BidSchema);

export default Bid;
