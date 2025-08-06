const mongoose=require("mongoose")
const saloonschema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    saloonName:{
        type:String,
        required:true
    },
    saloonLocation:{
        type:String,
        required:true
    },
    saloonContactNumber:{
        type:Number,
        required:true
    },
    religion:{
        type:String,
        enum:["Hinduism","Islam","Christianity","Sikhism","Buddhism","Jainism"]
    },
    caste:String,
    saloonservices:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    }],
    barbers:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    ],
      image: {
  url: String,           
  public_id: String      
},


//new section reviews 30-07-2025 starts from tomarrow
     reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: String,
        rating: Number,
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    
})

module.exports=mongoose.model("Saloon",saloonschema)