

const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  setUserRestaurantIds,
  createReviews,
  getAllReviews,
  getReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");
const authController = require("../controllers/authController");

router.use(authController.protect);


router.route("/")
  .get(getAllReviews)
  .post(setUserRestaurantIds, createReviews);

router.route("/:reviewId")
  .get(getReview)
  .patch(updateReview)
  .delete(deleteReview);

module.exports = router;
