const express=require('express')
const router=express.Router()
const auth=require('auth')
const fs=require('fs')
const jwt=require('jsonwebtoken')

router.post('/',auth,(req,res)=>{
    
})

module.exports=router