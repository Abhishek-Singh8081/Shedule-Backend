const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true
  },
  barber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  saloon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Saloon",
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true
  },
  bookingDate: {
    type: Date,
    required: true
  },
  slot: {
    startTime: { type: String, required: true },  
    endTime: { type: String, required: true },    
  },
 discountPrice:{
    type: Number,
    default:0
 },
  totalPrice: {
    type: Number,
    required: true
  },
 
  paymentMethod: {
    type: String,
    enum: ["COD", "Online"],
    default: "COD"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending"
  },
  bookingStatus: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String 
  }
});

module.exports = mongoose.model("Booking", BookingSchema);
