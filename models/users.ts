import mongoose from "mongoose";
import { required } from "../utils/utils.ts";

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: required(String),
});

export default mongoose.model("Users", userSchema);
