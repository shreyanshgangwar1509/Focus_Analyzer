import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name : String,
    email: String,
    password: String
})

const User = mongoose.model('log_reg_form', userSchema);

export default User;