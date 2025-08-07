const mongoose = require("mongoose")

const infoschema = mongoose.Schema({
    heading: {
        type: String,
        default:"Book now and see what our friendly, highly skilled and inspired team can do for you. You will look good and feel great."
    },
    address: {
        type: String,
        required: true
    },
    phone1: {
        type: Number,
        required: true
    },
    phone2: {
        type: Number
    },
     quickLinks: {type: [String],
      validate: {
        validator: (v) => v.length <= 5,
        message: "You can only have up to 5 links care items.",
      },
      default: [],},
    buisnessHours: {
        monday: {
            start: { type: String },
            end: { type: String },
            isOpen: { type: Boolean }   // true = isOpen, false = leave
        },
        tuesday: {
            start: { type: String },
            end: { type: String },
            isOpen: { type: Boolean }
        },
        wednesday: {
            start: { type: String },
            end: { type: String },
            isOpen: { type: Boolean }
        },
        thursday: {
            start: { type: String },
            end: { type: String },
            isOpen: { type: Boolean }
        },
        friday: {
            start: { type: String },
            end: { type: String },
            isOpen: { type: Boolean }
        },
        saturday: {
            start: { type: String },
            end: { type: String },
            isOpen: { type: Boolean }
        },
        sunday: {
            start: { type: String },
            end: { type: String },
            isOpen: { type: Boolean }
        },
    }


})

module.exports=mongoose.model("Information",infoschema)