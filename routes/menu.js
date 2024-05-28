

const express = require("express");
const router = express.Router({ mergeParams: true });
const { getAllMenus, createMenu, deleteMenu } = require("../controllers/menuController");

router.get("/", getAllMenus);
router.post("/", createMenu);
router.delete("/:menuId", deleteMenu);

module.exports = router;
