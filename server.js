const server=require("./socket-server");
const mongoose=require("mongoose");


function connectDB(){
    try{
        mongoose.connect(process.env.DB_CONNECTION.replace("<username>",process.env.DB_USERNAME).replace("<password>",process.env.DB_PASSWORD).replace("myDatabase",process.env.DB_NAME),{
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
    console.log("Server started...");
    connectDB();
})
