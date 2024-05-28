
const Restaurant = require("../models/restaurant");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");

exports.getAllRestaurants = catchAsync(async (req, res) => {
  const features = new APIFeatures(Restaurant.find(), req.query).sort().pagination();
  const restaurants = await features.query;
  res.status(200).json({
    status: "success",
    count: restaurants.length,
    restaurants: restaurants,
  });
});

exports.createRestaurant = catchAsync(async (req, res) => {
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json({
    status: "success",
    data: restaurant,
  });
});

exports.getRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant)
    return next(new ErrorHandler("No Restaurant found with that ID", 404));
  res.status(200).json({
    status: "success",
    data: restaurant,
  });
});

exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.id);
  if (!restaurant)
    return next(new ErrorHandler("No document found with that ID", 404));
  res.status(204).json({
    status: "success",
  });
});
