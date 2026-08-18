import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  telephoneOne: { type: String },
  telephoneTwo: { type: String },
  secondaryEmail: { type: String },
  country: { type: String },
  state: { type: String },
  addressLineOne: { type: String },
  addressLineTwo: { type: String },
  addressLineThree: { type: String },
  houseNo: { type: String },
  street: { type: String },
  province: { type: String },
  postalCode: { type: String },
  zipCode: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
});

const contact = mongoose.model("contacts", ContactSchema);

export default contact;
