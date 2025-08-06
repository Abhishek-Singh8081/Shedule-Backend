const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    saloonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Saloon",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true, // adds createdAt and updatedAt fields
  }
);


const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
