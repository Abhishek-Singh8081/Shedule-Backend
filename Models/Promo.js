const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema(
  {
    title: {
      type: String, 
      trim: true,
      required:true
    },
    description:{
        type:String,
        trim:true,
        required:true
    },
    background: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Promo", promoSchema);
