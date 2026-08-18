import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
    
});

const Account = mongoose.model('institution-accounts', AccountSchema);

module.exports = {
    Account, AccountSchema
};