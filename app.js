const express=require("express");
const cookieParser=require("cookie-parser");
const cors=require("cors");
const dotenv=require("dotenv");
const authRouter=require("./routes/authRouter");

dotenv.config({path:".env"});


const app=express();

const allowedOrigins = [
    `${process.env.FRONTEND_URL}`
]


const corsOptions={
    // origin:`${process.env.REACT_URL}`,
    // credentials:true
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());


app.use("/api/v1/connect",authRouter);


app.use("/",(req,res)=>{
    try{
        res.status(200).json({
            status:"success"
        })
    }catch(err){
        res.status(400).json({
            status:"failed"
        })
    }
})



module.exports=app;