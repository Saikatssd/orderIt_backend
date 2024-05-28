const Coupon = require("../models/couponModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");

exports.createCoupon = catchAsync(async (req, res, next) => {
  const newCoupon = await Coupon.create(req.body);
  res.status(201).json({ status: "success", data: newCoupon });
});

exports.getCoupon = catchAsync(async (req, res, next) => {
  const coupons = await Coupon.find();
  res.status(200).json({ status: "success", data: coupons });
});

exports.updateCoupon = catchAsync(async (req, res, next) => {
  const updatedCoupon = await Coupon.findByIdAndUpdate(req.params.couponId, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedCoupon) {
    return next(new ErrorHandler("No Coupon found with that ID", 404));
  }

  res.status(200).json({ status: "success", data: updatedCoupon });
});

exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const deletedCoupon = await Coupon.findByIdAndDelete(req.params.couponId);

  if (!deletedCoupon) {
    return next(new ErrorHandler("No coupon found with given Id", 404));
  }

  res.status(204).json({ status: "success" });
});

exports.couponValidate = catchAsync(async (req, res, next) => {
  const { couponCode, cartItemsTotalAmount } = req.body;

  const couponDetails = await Coupon.aggregate([
    {
      $addFields: {
        finalTotal: {
          $cond: [
            { $gte: [cartItemsTotalAmount, "$minAmount"] },
            {
              $subtract: [
                cartItemsTotalAmount,
                {
                  $min: [
                    {
                      $multiply: [cartItemsTotalAmount, { $divide: ["$discount", 100] }],
                    },
                    "$maxDiscount",
                  ],
                },
              ],
            },
            cartItemsTotalAmount,
          ],
        },
        message: {
          $cond: [
            { $gte: [cartItemsTotalAmount, "$minAmount"] },
            "",
            {
              $concat: [
                "add ₹ ",
                { $toString: { $subtract: ["$minAmount", cartItemsTotalAmount] } },
                " more to avail this offer",
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        _id: 0,
        subTitle: 1,
        couponName: 1,
        details: 1,
        minAmount: 1,
        finalTotal: 1,
        message: 1,
      },
    },
  ]);

  if (!couponDetails) {
    return next(new ErrorHandler("Invalid coupon code.", 404));
  }

  res.status(200).json({ status: "success", data: couponDetails });
});
