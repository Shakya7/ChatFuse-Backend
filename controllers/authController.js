const User=require("../models/userModel");
const jwt=require("jsonwebtoken");
const crypto=require("crypto");
const bcrypt=require("bcryptjs");


exports.signup=async(req,res)=>{
    try{
    const newUser=await User.create(req.body);
    const token=jwt.sign({id:newUser._id,email:newUser.email},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES});
    const cookieOptions={
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRES*24*60*60*1000),
        httpOnly:true,
        secure:true,
        sameSite:"none"
    }
    res.cookie("jwt",token,cookieOptions);
    res.status(201).json({
        status:"success",
        data:{
            user:newUser
        }
    })
    }catch(err){
        res.status(400).json({
            status:"failed",
            message: err.message
        })
    }
}

exports.login=async(req,res)=>{    
    try{
        const {email,password}=req.body;
        const user=await User.findOne({
            email:email
        }).select("+password");
        if(!user)
            throw `Please enter a valid email or password`;
        const correct=await user.compareNormalPwithHashedP(password,user.password);
        if(!correct) 
            throw `Please provide valid email or password`;   
        const token= jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES}); 
        const cookieOptions={
            expires:new Date(Date.now()+process.env.COOKIE_EXPIRES*24*60*60*1000),
            httpOnly:true,
            secure:true,
            sameSite:"none"
        }
        res.cookie("jwt",token,cookieOptions);
        res.status(200).json({
            status:"success",
            message:"You have logged in successfully",
            data:{
                user,
            }
        })
    }catch(err){
        res.status(400).json({
            status:"failed",
            message: err.message
        })
    }
}

exports.logout=async(req,res)=>{
    try{
        const cookieOptions={
            expires: new Date(Date.now()-10*1000),
            httpOnly:true,
            secure:true,
            sameSite:"none"
        };
        res.cookie("jwt","null",cookieOptions);
        res.clearCookie('jwt');
        res.status(200).json({
            status:"success",
            message:"Cookie has been deleted"
        });
    }catch(err){
        res.status(400).json({
            status:"failed",
            message: err.message
        })
    }
}

exports.protectRouteWithJWT=async(req,res,next)=>{
    try{
    let token;
    if(req.cookies.jwt)
        token=req.cookies.jwt;
    if(!token)
        return next("Authentication failed...please try again");
    const decoded=jwt.verify(token,process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES});
    const user=await User.findById({_id:decoded.id});
    if(!user)
        return next("No user found! Please signup first...");
    res.user=user;
    next();
    }catch(err){
        res.status(400).json({
            status:"fail",
            message:err.message
        })
    }
}

exports.checkCookiePresent=async(req,res)=>{
    try{
    let token;
    if(req.cookies.jwt)
        token=req.cookies.jwt;
    if(!token)
        throw "Cookie not found. User is not logged in";
    const decoded=jwt.verify(token,process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES});
    const user=await User.findById({_id:decoded.id});
    if(!user)
        throw "No user found! Please login first...";
    res.status(200).json({
        status:"success",
        data:{
            message:"User is logged in",
            userID:decoded.id
        }
    });
    }catch(err){
        res.status(401).json({
            status:"failure",
            data:{
                message:err.message
            }
        });
    }    
}