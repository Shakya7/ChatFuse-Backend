const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
const validator=require("validator");
const crypto=require("crypto");

const userSchema=new mongoose.Schema({

    name:{type:String,required:true},

    email:{
        type:String, 
        lowercase:true,
        required:[true,"Please enter your email address"],
        validate:[validator.isEmail,"Please enter a valid email id..."],
        unique:[true, "Please enter a unique email address"]
    },

    conversations:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation"
    }],

    pinnedMessages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Conversation"
    }],

    avatar:{
        type:String,
        default:"https://www.gravatar.com/avatar/?d=mp"
    },

    password:{type:String,required:[true, "Please enter a password"]},

    passwordChangedAt:{type:Date},

    passwordResetToken:String,

    passwordResetTokenExpiry:Date,

    friends:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],

    role:{
        type:String,
        enum:["user","admin"]
    },
    socketID:String,

    status:{
        type:String,
        enum:["Online","Offline"],
        default:"Offline"
    },
    servers:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Server"
    }]

},{
    timestamps:true
});


//INSTANCE METHODS OF userSchema model ---> doc created out of schema [ const doc=await User.findById(); this doc will have access to the instance methods]

//checking normal password with hashed password --> used in login func to check DB hashed password with form input, i.e String unecrypted pw
userSchema.methods.compareNormalPwithHashedP=async function(userPass,dbPassHashed){
    return await bcrypt.compare(userPass,dbPassHashed);
}
//create a reset token and update the DB fields of reset token and reset token expiry; finally return token
userSchema.methods.getResetToken=async function(){
    const resetToken=crypto.randomBytes(32).toString("hex");
    this.passwordResetToken=crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetTokenExpiry=Date.now()+10*60*1000;
    return resetToken;
}
userSchema.methods.clearResetToken=function(){
    this.passwordResetToken=undefined;
    this.passwordResetTokenExpiry=undefined;
}


//pre-middleware for encrypting the password with bcrypt
userSchema.pre("save",async function(next){
    if(!this.isNew)     //if password is not changed, simply return
        return next();
    else if(!this.isModified("password"))
        return next();
    this.password=await bcrypt.hash(this.password,12);
    this.passwordChangedAt=Date.now()-1000;
    next();
});


const User=mongoose.model("User",userSchema);
module.exports=User;