const express=require('express')
const router=express.Router()
const urlController=require('../controllers/urlController.js')

router.post('/url/shorten',urlController.createShortUrl);

router.get('/:urlCode',urlController.redirectShortUrl);

router.all("/*",(req,res)=>{
    res.status(400).send({status:false,message:"Invalid Request!! Make sure your endpoint is correct!!"})
})


module.exports=router