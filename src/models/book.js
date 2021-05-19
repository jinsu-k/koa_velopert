const mongoose = require("mongoose");
const { Schema } = mongoose;

const Author = new Schema({
  name: String,
  email: String,
});

const Book = new Schema({
  title: String,
  authors: [Author],
  publishedDate: Date,
  price: Number,
  tags: [String],
  createAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Book", Book);
