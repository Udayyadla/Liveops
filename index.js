const express=require("express")
const mongoose=require("mongoose");
const bodyparser=require("body-parser")
const app=express();
const userRoutes=require("./routes/user-routes")
const offerRoutes=require("./routes/offer-routes")
app.use(express.json());
app.use(bodyparser.json())
mongoose.connect("mongodb+srv://uday:uday1997@cluster0.3vwhve8.mongodb.net/?retryWrites=true&w=majority",{
    useNewUrlParser:true,useUnifiedTopology:true
})
.then(()=>console.log("mongodb connected"))
.catch((err)=>console.log(err))
app.listen(4000,()=>console.log("server is listening....."))
app.use("/",userRoutes)
app.use("/offers",offerRoutes)