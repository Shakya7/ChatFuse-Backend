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
        let friends=await User.findById(req.body.profileID,"friends").populate("friends","name email");
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

        console.log(friends.friends);
        console.log(users);

        //state.searchedUsers.filter((user)=>!action.payload.some(friend => friend._id.toString() === user._id.toString()));
        users=users.filter((user)=>!friends.friends.some(friend=>friend._id.toString()===user._id.toString()));

        //Filtering out the own record
        users=users.filter((user)=>user._id.toString()!==req.body.profileID);

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

exports.getFriends=async(req,res)=>{
    try{
        let friends=await User.findById(req.body.profileID,"friends").populate("friends","name email");
        console.log(friends.friends);
        res.status(200).json({
            status:"success",
            friends:friends.friends
        })
    }catch(err){
        res.status(400).json({
            status:"failed",
            message: err.message
        })
    }
}