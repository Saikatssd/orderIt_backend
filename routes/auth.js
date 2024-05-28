

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const upload = require('../middlewares/multer');

router.post("/signup",upload.single('avatar'), authController.signup);
router.post("/login", authController.login);
router.post("/forgetPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);
router.put("/updateProfile", authController.updateProfile); 
router.get("/me",authController.protect, authController.getUserProfile); 
router.put("/me/update", authController.updatePassword);
router.patch("/password/update", authController.updatePassword);
router.get("/logout", authController.logout); 

module.exports = router;
