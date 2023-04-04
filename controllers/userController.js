const User=require("../models/userModel");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");

exports.getProfileData=async(req,res)=>{
    try{
        //const user=await User.findById(req.params.id);
        let user;
        if(res.user)
            user=res.user;
        if(!user)
            return next("Authentication failed...please check again");
        res.status(200).json({
            status:"success",
            data:{
                user
            }
        })

    }catch(err){
        res.status(400).json({
            status:"failed",
            message: err.message
        })
    }
}