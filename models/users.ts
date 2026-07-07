import mongoose from "mongoose";
import { required } from "../utils.ts";

const userSchema = new mongoose.Schema({
  email: required(String),
  password: required(String),
});

export default mongoose.model("Users", userSchema);
