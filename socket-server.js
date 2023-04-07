const socketio=require("socket.io");
const app=require("./app");
const http=require("http");
const FriendRequest=require("./models/friendRequestModel");
const User=require("./models/userModel");

const server=http.createServer(app);


const io=socketio(server,{
    cors:{
        origin: `${process.env.FRONTEND_URL}`,
        methods: ["GET","POST"]
    }
});

/*

io.on("connection",(socket)=>{

    Emitting events ways:

    1) socket.emit(".....")  ------>only to the single client that is connected to socket server (in one's own browser only)

    2) socket.broadcast.emit(".....") --->to all the clients, except the single client

    3) io.emit(".....")  ------> to all the clients
})


*/

io.on("connection",async(socket)=>{
    console.log(socket.id);
    io.emit("welcome-message",`${socket.id} joined the chat`);

    //Extracting out the user ID from the socket that is currently connected
    const user_id = socket.handshake.query["user_id"];

    console.log(`User connected ${socket.id}`);

    if (Boolean(user_id)) {
        await User.findByIdAndUpdate(user_id, {
        socketID: socket.id,
        status: "Online",
        });
    }
    //socket.emit("message","Welcome to chat app");
    //socket.broadcast.emit("user_online",`${socket.id}`);
    //io.emit("load_online_frnds",io.engine.clientsCount);

    // socket.on("disconnecting",(reason)=>{
    //     console.log(`${socket.id} left the chat`);
    //     socket.emit("disconnection_process",`${socket.id} left the chat`);
    // })

    socket.on("send-friend-request", async(data)=>{
        console.log(data);
        const sender = await User.findById(data.sender).select("name socketID");
        const receiver = await User.findById(data.receiver).select("name socketID");

        console.log(sender, receiver);

        await FriendRequest.create({
            sender: data.sender,
            receiver: data.receiver,
        });

        io.to(receiver?.socketID).emit("new-friend-request", {
            message: "New friend request received",
            sender: sender.name
        });

        io.to(sender?.socketID).emit("friend-request-sent", {
            message: "Request Sent successfully!",
            receiver: receiver.name
        });

    })

    socket.on("disconnect", (reason) => {
        console.log("User left the chat");
        console.log(socket.id);
        //socket.broadcast.emit("left_message",`${socket.id} left the chat!!!!!`);
        
    });

    // socket.on("load_online_frnds",(data)=>{
    //     console.log(data);
    // })
})

module.exports=server;







