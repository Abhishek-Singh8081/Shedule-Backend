const mongoose = require("mongoose");

const servicesSchema = new mongoose.Schema(
  {
    servicename: {
      type: String,
      required: [true, "Services name is required"],
      trim: true,
      maxlength: 100,
      unique: true,
    },
    published:{
      type:Boolean,
      default:true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required:true
    },
    saloonId:{
         type: mongoose.Schema.Types.ObjectId,
      ref: "Saloon", 
      required:true
    },
    categoryId:{
         type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required:true

    },
    description:String,
    priceType:{
    type:String,
    enum:["Free","Fixed"]
    },
    price:{
    type:Number
    },
    duration:{
        type:Number,
        required:true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Service", servicesSchema);
