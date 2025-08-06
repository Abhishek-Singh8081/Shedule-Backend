const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: 100,
      unique: true,
    },
    published:{
      type:Boolean,
      default:true
    },
    services: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin/seller who created the attribute
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
