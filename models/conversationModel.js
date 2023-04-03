const mongoose=require("mongoose");

const conversationSchema=new mongoose.Schema({
    users:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],

    groupChat:{type:Boolean,default:false},

    latestMessage:{type:mongoose.Schema.Types.ObjectId},

    groupAdmin:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    
    media:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message"
    }]

},{
    timestamps:true
})

const Conversation=mongoose.model("Conversation",conversationSchema);
module.exports=Conversation;