const mongoose=require("mongoose");

const friendRequestSchema=new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    createdAt:Date
})

const FriendRequest=mongoose.model("FriendRequest",friendRequestSchema);
module.exports=FriendRequest;