const express=require("express");
const userController=require("../controllers/userController");
const authController=require("../controllers/authController");

const router=express.Router();

router.route("/getProfileData/:id").get(authController.protectRouteWithJWT, userController.getProfileData);

module.exports=router;