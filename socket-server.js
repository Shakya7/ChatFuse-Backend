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
    socket.broadcast.emit("friend-connected",{
        id:user_id      
    })

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

    });


    socket.on("accept-friend-request", async (data) => {
       
        console.log(data);
        const request_doc = await FriendRequest.findOne({sender:data.sender, receiver:data.profileID});
        const send_doc=await FriendRequest.findOne({sender:data.profileID, receiver:data.sender});
    
        console.log(request_doc);
        console.log(send_doc);

        if(request_doc){
            const sender = await User.findById(request_doc.sender);
            const receiver = await User.findById(request_doc.receiver);
        
            sender.friends.push(request_doc.receiver);
            receiver.friends.push(request_doc.sender);
        
            await receiver.save({ new: true, validateModifiedOnly: true });
            await sender.save({ new: true, validateModifiedOnly: true });
        
            await FriendRequest.findByIdAndDelete(request_doc._id);
            if(send_doc)
                await FriendRequest.findByIdAndDelete(send_doc._id);
        
        
            // emit event request accepted to both
            io.to(sender?.socketID).emit("request-accepted", {
            message: "Friend Request Accepted",

            });
            io.to(receiver?.socketID).emit("request-accepted", {
            message: "Friend Request Accepted",
            senderID:data.sender,
            receiverID:data.profileID
            });
        }
    });

    socket.on("decline-friend-request",async(data)=>{
        const request_doc = await FriendRequest.findOne({sender:data.sender, receiver:data.profileID});
        const send_doc=await FriendRequest.findOne({sender:data.profileID, receiver:data.sender});
        if(request_doc){
            const sender = await User.findById(request_doc.sender);
            const receiver = await User.findById(request_doc.receiver);
            await FriendRequest.findByIdAndDelete(request_doc._id);
            if(send_doc)
                await FriendRequest.findByIdAndDelete(send_doc._id);
        
        

            io.to(sender?.socketID).emit("request-declined", {
                message: `Friend Request Declined from ${data.name}`,

            });
            io.to(receiver?.socketID).emit("request-declined", {
                message: "Friend Request Declined",
                senderID:data.sender,
                receiverID:data.profileID
            });
        }
    });



    socket.on("disconnect", async(reason) => {
        console.log("User left the chat");
        console.log(socket.id);
        //socket.broadcast.emit("left_message",`${socket.id} left the chat!!!!!`);
        await User.findByIdAndUpdate(user_id, {
            socketID: "",
            status: "Offline",
        });
        socket.broadcast.emit("friend-disconnected",{
            id:user_id
        })
        
    });

    // Socket event for sending messages in real-time
    socket.on("send-message", async(data) => {
        try {
            console.log("Message received:", data);
            const { conversationId, recipientId, message } = data;

            // Get recipient's socket ID
            const recipient = await User.findById(recipientId).select("socketID");
            
            if (recipient?.socketID) {
                // Emit message to recipient
                io.to(recipient.socketID).emit("receive-message", {
                    conversationId,
                    message,
                    senderId: user_id,
                    timestamp: new Date()
                });
            }

            // Also emit back to sender to confirm delivery
            socket.emit("message-sent", {
                conversationId,
                message,
                timestamp: new Date()
            });
        } catch (err) {
            console.error("Send message error:", err.message);
            socket.emit("message-error", {
                error: err.message
            });
        }
    });

    // Socket event for typing indicator
    socket.on("typing", async(data) => {
        try {
            const { conversationId, recipientId } = data;
            const recipient = await User.findById(recipientId).select("socketID");
            
            if (recipient?.socketID) {
                io.to(recipient.socketID).emit("user-typing", {
                    conversationId,
                    senderId: user_id
                });
            }
        } catch (err) {
            console.error("Typing error:", err.message);
        }
    });

    // Socket event for stop typing
    socket.on("stop-typing", async(data) => {
        try {
            const { conversationId, recipientId } = data;
            const recipient = await User.findById(recipientId).select("socketID");
            
            if (recipient?.socketID) {
                io.to(recipient.socketID).emit("user-stop-typing", {
                    conversationId,
                    senderId: user_id
                });
            }
        } catch (err) {
            console.error("Stop typing error:", err.message);
        }
    });

    // Socket event for marking messages as read
    socket.on("mark-message-read", async(data) => {
        try {
            const { conversationId, recipientId } = data;
            const recipient = await User.findById(recipientId).select("socketID");
            
            if (recipient?.socketID) {
                io.to(recipient.socketID).emit("message-read-receipt", {
                    conversationId,
                    readBy: user_id
                });
            }
        } catch (err) {
            console.error("Mark read error:", err.message);
        }
    });

    // socket.on("load_online_frnds",(data)=>{
    //     console.log(data);
    // })
})

module.exports=server;







