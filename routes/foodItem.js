

const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getFoodItem,
  createFoodItem,
  getAllFoodItems,
  deleteFoodItem,
  updateFoodItem,
} = require("../controllers/foodItemController");

router.route("/item")
  .post(createFoodItem);

router.route("/items/:storeId")
  .get(getAllFoodItems);

router.route("/item/:foodId")
  .get(getFoodItem)
  .patch(updateFoodItem)
  .delete(deleteFoodItem);

module.exports = router;
