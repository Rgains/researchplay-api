import mongoose from "mongoose";
import { acctTypes, acctStatuses } from "../../types";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 16 },
  fname: { type: String },
  lname: { type: String },
  username: { type: String },
  acctType: [{
    type: String,
    enum: acctTypes,
  }],
  institutions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'institution' }],
  organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'organization' }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'team' }],
  orgEmail: { type: String, },
  institutionEmail: { type: String, },
  onboardingCompleted: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  status: { type: String, enum: acctStatuses, default: acctStatuses[1] }
});

// UserSchema.pre('save', function (next) {
//   if(this.acctType.length > 1 && this.acctType.includes(acctTypes[3])) {
//     this.acctType = [];
//     this.acctType[0] = acctTypes[1];
//     this.acctType[1] = acctTypes[3]
//   }
// });

const User = mongoose.model("users", UserSchema);

export default User;