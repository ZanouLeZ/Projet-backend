import mongoose from "mongoose";
import { required } from "../utils/utils.ts";

const ratingSchema = new mongoose.Schema(
  {
    userId: required(String),
    grade: required(Number),
  },
  { _id: false },
);

const bookSchema = new mongoose.Schema({
  userId: required(String),
  title: required(String),
  author: required(String),
  imageUrl: required(String),
  year: required(Number),
  genre: required(String),
  ratings: [ratingSchema],
  averageRating: { type: Number, default: 0 },
});

export default mongoose.model("Books", bookSchema);
