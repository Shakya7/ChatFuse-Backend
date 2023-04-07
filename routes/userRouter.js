const express=require("express");
const userController=require("../controllers/userController");
const authController=require("../controllers/authController");

const router=express.Router();

router.route("/getProfileData/:id").get(authController.protectRouteWithJWT, userController.getProfileData);
router.route("/getUsers").post(userController.findUsers);
router.route("/getFriendRequestedUsers").post(userController.getFriendRequestedUsers);
router.route("/getUsersWhoSentRequests").post(userController.getUsersWhoSentRequests);

module.exports=router;