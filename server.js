const server=require("./socket-server");
const mongoose=require("mongoose");


async function connectDB(){
    try{
        await mongoose.connect(process.env.DB_CONNECTION.replace("<db_username>",process.env.DB_USERNAME).replace("<db_password>",process.env.DB_PASSWORD),{
            useNewUrlParser: true,
            useUnifiedTopology:true
        });
        console.log("DB successfully connected");
        console.log("Listening to requests");
    }catch(err){
        console.error("Unable to connect to database");
        console.log(err.message);
    }
}



server.listen(process.env.PORT || 4000,()=>{
    console.log("Server started...", process.env.PORT);
    connectDB();
})
