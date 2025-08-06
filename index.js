require("dotenv").config()
const express=require("express")
const cors=require("cors")
const app=express()
const connectDB=require("./Database/DB")
const fileupload = require("express-fileupload");
const Authrouter=require("./Routes/Authrouter")
const Userrouter=require("./Routes/Userrouters")
const cloudinaryStorage=require("./Config/Cloudinary")
const Saloonrouter=require("./Routes/Saloonrouter")
const Adminrouter=require("./Routes/Adminrouter")

app.use(fileupload({ useTempFiles: true }));
app.use(cors());
app.use(express.json());

app.use("/api/v1/auth",Authrouter)
app.use("/api/v1/user",Userrouter)
app.use("/api/v1/saloon",Saloonrouter)
app.use("/api/v1/admin",Adminrouter)


connectDB().then(()=>{  
    app.listen(process.env.PORT,(req,res)=>{
        console.log("server is running on port",process.env.PORT)
    })
}
) 
cloudinaryStorage()