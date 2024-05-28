

const express = require("express");
const router = express.Router();
const {
  createCoupon,
  getCoupon,
  updateCoupon,
  deleteCoupon,
  couponValidate,
} = require("../controllers/couponController");

router.route("/")
  .post(createCoupon)
  .get(getCoupon);

router.route("/:couponId")
  .patch(updateCoupon)
  .delete(deleteCoupon);

router.route("/validate")
  .post(couponValidate);

module.exports = router;
