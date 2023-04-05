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


exports.addFriend=async(req,res)=>{
    try{
        const user=await User.findByIdAndUpdate(req.params.id,{
            $push:{
                friends:req.body
            }
        },{new:true});
    }catch(err){
        res.status(400).json({
            status:"failed",
            message: err.message
        })
    }
}

exports.findUsers=async(req,res)=>{
    try{
        let users=[];
        const regex = new RegExp(req.body.searchTerm, 'i');
        if(req.body.type==="email"){
            users=await User.find({
                email:{$regex:regex}
            }).select("name email")
        }
        else{
            users=await User.find({
                name:{$regex:regex}
            }).select("name email")
        }
        res.status(200).json({
            status:"success",
            users
        })

    }catch(err){
        res.status(400).json({
            status:"failed",
            message: err.message
        })
    }
}