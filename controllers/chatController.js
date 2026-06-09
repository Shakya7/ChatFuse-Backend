const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");
const User = require("../models/userModel");

// Get or create conversation between two users
exports.getOrCreateConversation = async (req, res) => {
    try {
        const { otherUserId } = req.body;
        const currentUserId = req.user._id;

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            groupChat: false,
            users: {
                $all: [currentUserId, otherUserId]
            }
        }).populate("users", "name avatar socketID");

        // If not found, create new conversation
        if (!conversation) {
            conversation = await Conversation.create({
                groupChat: false,
                users: [currentUserId, otherUserId]
            });
            conversation = await conversation.populate("users", "name avatar socketID");
        }

        res.status(200).json({
            status: "success",
            data: {
                conversation
            }
        });
    } catch (err) {
        console.error("Get/Create Conversation Error:", err.message);
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;
        const senderId = req.user._id;

        // Validate inputs
        if (!conversationId || !content) {
            return res.status(400).json({
                status: "failed",
                message: "Conversation ID and content are required"
            });
        }

        // Create message
        const message = await Message.create({
            sender: senderId,
            content: content,
            chatWindow: conversationId,
            readBy: [senderId]
        });

        // Populate sender details
        await message.populate("sender", "name avatar");

        // Update conversation's latest message
        await Conversation.findByIdAndUpdate(
            conversationId,
            {
                latestMessage: message._id
            },
            { new: true }
        );

        res.status(201).json({
            status: "success",
            data: {
                message
            }
        });
    } catch (err) {
        console.error("Send Message Error:", err.message);
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

// Get all messages for a conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const messages = await Message.find({
            chatWindow: conversationId
        })
        .populate("sender", "name avatar")
        .sort({ createdAt: 1 });

        res.status(200).json({
            status: "success",
            data: {
                messages
            }
        });
    } catch (err) {
        console.error("Get Messages Error:", err.message);
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

// Get a single conversation by ID
exports.getConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findById(conversationId)
        .populate("users", "name avatar socketID status")
        .populate("latestMessage");

        if (!conversation) {
            return res.status(404).json({
                status: "failed",
                message: "Conversation not found"
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                conversation
            }
        });
    } catch (err) {
        console.error("Get Conversation Error:", err.message);
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

// Get all conversations for current user
exports.getUserConversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({
            users: userId
        })
        .populate("users", "name avatar socketID status")
        .populate("latestMessage")
        .sort({ updatedAt: -1 });

        res.status(200).json({
            status: "success",
            data: {
                conversations
            }
        });
    } catch (err) {
        console.error("Get Conversations Error:", err.message);
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

// Mark message as read
exports.markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.body;
        const userId = req.user._id;

        const message = await Message.findByIdAndUpdate(
            messageId,
            {
                $addToSet: { readBy: userId }
            },
            { new: true }
        ).populate("sender", "name avatar");

        res.status(200).json({
            status: "success",
            data: {
                message
            }
        });
    } catch (err) {
        console.error("Mark Message as Read Error:", err.message);
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

// Delete a message
exports.deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({
                status: "failed",
                message: "You can only delete your own messages"
            });
        }

        await Message.findByIdAndDelete(messageId);

        res.status(200).json({
            status: "success",
            message: "Message deleted successfully"
        });
    } catch (err) {
        console.error("Delete Message Error:", err.message);
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};

// Create a new group chat
exports.createGroupConversation = async (req, res) => {
    try {
        const { groupName, memberIds } = req.body;
        const currentUserId = req.user._id;

        if (!groupName || !memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({
                status: "failed",
                message: "Group name and at least one member are required"
            });
        }

        // Add creator to group users
        const uniqueUsers = Array.from(new Set([currentUserId.toString(), ...memberIds.map(id => id.toString())]));

        const conversation = await Conversation.create({
            groupChat: true,
            chatName: groupName,
            users: uniqueUsers,
            groupAdmin: [currentUserId]
        });

        const populatedConversation = await Conversation.findById(conversation._id)
            .populate("users", "name avatar socketID status")
            .populate("latestMessage");

        // Emit socket event to online members of the group
        const io = req.app.get("io");
        if (io) {
            populatedConversation.users.forEach((u) => {
                if (u._id.toString() !== currentUserId.toString() && u.socketID) {
                    io.to(u.socketID).emit("group-created", {
                        conversation: populatedConversation
                    });
                }
            });
        }

        res.status(201).json({
            status: "success",
            data: {
                conversation: populatedConversation
            }
        });
    } catch (err) {
        console.error("Create Group Conversation Error:", err.message);
        res.status(400).json({
            status: "failed",
            message: err.message
        });
    }
};
