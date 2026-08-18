import mongoose from "mongoose";

const PaymentDetailSchema = new mongoose.Schema({
  bank: { type: String },
  accountName: { type: String },
  accountNo: { type: String },
  accounType: { type: String },
  branch: { type: String },
  sortCode: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

const paymentDetail = mongoose.model("", PaymentDetailSchema);

export default paymentDetail;
