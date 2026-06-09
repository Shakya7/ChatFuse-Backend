const express = require("express");
const authController = require("../controllers/authController");
const chatController = require("../controllers/chatController");

const router = express.Router();

// Middleware to protect routes
router.use(authController.protectRouteWithJWT);

// Get or create conversation
router.route("/get-or-create").post(chatController.getOrCreateConversation);

// Create group conversation
router.route("/create-group").post(chatController.createGroupConversation);

// Send message
router.route("/send-message").post(chatController.sendMessage);

// Get messages for a conversation
router.route("/get-messages/:conversationId").get(chatController.getMessages);

// Get a single conversation by ID
router.route("/get-conversation/:conversationId").get(chatController.getConversation);

// Get all conversations for user
router.route("/get-conversations").get(chatController.getUserConversations);

// Mark message as read
router.route("/mark-read").post(chatController.markMessageAsRead);

// Delete message
router.route("/delete-message/:messageId").delete(chatController.deleteMessage);

module.exports = router;
