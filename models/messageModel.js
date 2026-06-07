const mongoose=require("mongoose");

const messageSchema=new mongoose.Schema({
    sender:{type:mongoose.Schema.Types.ObjectId, ref:"User", required:true},

    content: {
        type:String,
        required:true
    },

    format:{
        type:String,
        enum:["text","media","doc","link"],
        default:"text"
    },

    chatWindow:{type:mongoose.Schema.Types.ObjectId, ref:"Conversation", required:true},

    readBy:[{type:mongoose.Schema.Types.ObjectId, ref:"User"}],
    
    reactions:[{
        type:String,
        user:{type:mongoose.Schema.Types.ObjectId, ref:"User"}
    }]

},{
    timestamps:true
})

const Message=mongoose.model("Message",messageSchema);
module.exports=Message;