const mongoose = require("mongoose");
const required = (Type: any) => ({
  Type,
  required: true,
});
const bookSchema = mongoose.Schema({
  title: required(String),
  description: required(String),
  imageUrl: required(String),
  userId: required(String),
  price: required(Number),
});

module.exports = mongoose.model("Thing", bookSchema);
