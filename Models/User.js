const mongoose=require("mongoose")

const Userschema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
  },
  password:{
    type:String,
    required:true
  },
   confirmPassword: { type: String, required: true },
   accountType:{
    type:String,
    enum:["User","Saloon","Admin","Barber"],
    required: true,
   },
   otp: String,
  otpExpires: Date,
  isEmailVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  image: {
  url: String,           // secure_url from Cloudinary
  public_id: String      // needed for deleting old image
},

  mobileNumber: String,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dateOfBirth: Date,
  alternativeMobileNumber: String,
  location: String,
  saloonId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Saloon"
  },
  workingHours: {
  monday: {
    start: { type: String },
    end: { type: String },
    available: { type: Boolean}   // true = available, false = leave
  },
  tuesday: {
    start: { type: String },
    end: { type: String },
    available: { type: Boolean}
  },
  wednesday: {
    start: { type: String },
    end: { type: String },
    available: { type: Boolean}
  },
  thursday: {
    start: { type: String },
    end: { type: String },
    available: { type: Boolean}
  },
  friday: {
    start: { type: String },
    end: { type: String },
    available: { type: Boolean}
  },
  saturday: {
    start: { type: String },
    end: { type: String },
    available: { type: Boolean}
  },
  sunday: {
    start: { type: String },
    end: { type: String },
    available: { type: Boolean}
  },
}

  
 
})

module.exports=mongoose.model("User",Userschema)