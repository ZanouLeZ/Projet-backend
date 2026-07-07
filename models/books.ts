import mongoose from "mongoose";
import { required } from "../utils.ts";

const bookSchema = new mongoose.Schema({
  userId: required(String),
  title: required(String),
  author: required(String),
  imageUrl: required(String),
  year: required(Number),
  genre: required(String),
  rating: {
    userId: { type: String },
    grade: { type: Number },
  },
  averageRating: { type: Number, default: 0 },
});

export default mongoose.model("Books", bookSchema);
