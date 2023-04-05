const socketio=require("socket.io");
const app=require("./app");
const http=require("http");

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

io.on("connection",(socket)=>{
    console.log("A user logged in now");
    console.log(socket.id);
    io.emit("welcome-message",`${socket.id} joined the chat`);
    //socket.emit("message","Welcome to chat app");
    //socket.broadcast.emit("user_online",`${socket.id}`);
    //io.emit("load_online_frnds",io.engine.clientsCount);

    // socket.on("disconnecting",(reason)=>{
    //     console.log(`${socket.id} left the chat`);
    //     socket.emit("disconnection_process",`${socket.id} left the chat`);
    // })

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







