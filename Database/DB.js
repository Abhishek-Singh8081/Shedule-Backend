const mongoose=require("mongoose")

const connectDB=async (req,res)=>{
    try {
        const response = await mongoose.connect(process.env.MONGOURI)
        if(response){
            console.log("Database connected successfully")
        }
        return response
        
    } catch (error) {
        console.log("Error in connecting db ",error)
        
    }
}
module.exports=connectDB