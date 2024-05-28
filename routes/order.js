const express = require("express");
const router = express.Router();
const { newOrder, getSingleOrder, myOrders } = require("../controllers/orderController");
const authController = require("../controllers/authController");



router.post("/new", authController.protect, newOrder);
router.get("/:id", authController.protect, getSingleOrder);
router.get("/me/myOrders", authController.protect, myOrders);


module.exports = router;
