const express=require('express')
const mongoose=require('mongoose')
const bodyparser=require('body-parser')
const route=require("./routes/route.js")

const app=express();

app.use(bodyparser.json());

mongoose.connect("mongodb+srv://ajit-07:pzD85GscINrNEeKB@cluster0.mzumpor.mongodb.net/Group52Database")
.then(()=>console.log("DB connected successfully!"))
.catch((err)=>console.log(err));


app.use('/',route);


app.listen(process.env.PORT || 3000,()=>{
    console.log("Backend server is running on port"+(process.env.PORT || 3000))
});