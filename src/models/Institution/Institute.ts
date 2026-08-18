import mongoose from "mongoose";

const InstituteSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  secondaryEmail: { type: String },
  password: { type: String },
  institutionName: { type: String, required: true },
  country: { type: String, },
  state: { type: String },
  lga: { type: String },
  province: { type: String },
  postalCode: { type: String },
  logo: { type: String },
  website: { type: String },
  administratorFullname: { type: String },
  administratorTelephone: { type: String },
  live_api_key: { type: String, unique: true },
  test_api_key: { type: String, unique: true },
  acctType: { type: String, },
  domain: { type: String },
});

const Institute = mongoose.model("institutes", InstituteSchema);

export default Institute;
