const User=require("../models/userModel");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const FriendRequest=require("../models/friendRequestModel");

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

// API for getting the users to whom user has sent friend requests
exports.getFriendRequestedUsers=async(req,res)=>{
    try{
        let users= await FriendRequest.find({sender:req.body.profileID}).populate("receiver","name email");
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

// API for getting the users who has sent the friend requests to the user
exports.getUsersWhoSentRequests=async(req, res)=>{
    try{
        let users=await FriendRequest.find({receiver:req.body.profileID}).populate("sender","name email")
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