
const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getAllRestaurants,
  createRestaurant,
  getRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const menuRoutes = require("./menu");
const reviewRoutes = require("./reviewsRoutes");



router.route("/")
  .get(getAllRestaurants)
  .post(createRestaurant);

router.route("/:storeId")
  .get(getRestaurant)
  .delete(deleteRestaurant);

if (menuRoutes && typeof menuRoutes === 'function') {
  router.use("/:storeId/menus", menuRoutes);
} else {
  console.error("menuRoutes is not defined or not a function.");
}

if (reviewRoutes && typeof reviewRoutes === 'function') {
  router.use("/:storeId/reviews", reviewRoutes);
} else {
  console.error("reviewRoutes is not defined or not a function.");
}

module.exports = router;
