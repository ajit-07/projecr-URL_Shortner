const express=require('express')
const router=express.Router()
const urlController=require('../controllers/urlController.js')

//const urlModel = require('../models/urlModel.js')
// router.get('/test',async function(req,res){
//     let getData=await urlModel.findOne().lean()
//     getData['name']='ajit'
//     console.log(getData)
//     return res.send({data:getData})
// })

router.post('/url/shorten',urlController.createShortUrl);

router.get('/:urlCode',urlController.redirectShortUrl);

router.all("/*",(req,res)=>{
    res.status(400).send({status:false,message:"Invalid Request!! Make sure your endpoint is correct!!"})
})


module.exports=router