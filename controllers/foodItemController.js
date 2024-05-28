const FoodItem = require('../models/foodItem');
const ErrorHandler = require('../utils/errorHandler');
const catchAsync = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');

exports.getAllFoodItems = catchAsync(async (req, res) => {
  let query = {};
  if (req.body.storeId) {
    query = { restaurant: req.body.storeId };
  }
  const foodItems = await FoodItem.find(query);
  res.status(200).json({
    status: 'success',
    results: foodItems.length,
    data: foodItems,
  });
});

exports.createFoodItem = catchAsync(async (req, res) => {
  const newFoodItem = await FoodItem.create(req.body);
  res.status(201).json({
    status: 'success',
    data: newFoodItem,
  });
});

exports.getFoodItem = catchAsync(async (req, res, next) => {
  const foodItem = await FoodItem.findById(req.params.foodId);
  if (!foodItem) {
    return next(new ErrorHandler('No foodItem found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: foodItem,
  });
});

exports.updateFoodItem = catchAsync(async (req, res, next) => {
  const updatedFoodItem = await FoodItem.findByIdAndUpdate(
    req.params.foodId,
    req.body,
    { new: true, runValidators: true }
  );
  if (!updatedFoodItem) {
    return next(new ErrorHandler('No document found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: updatedFoodItem,
  });
});

exports.deleteFoodItem = catchAsync(async (req, res, next) => {
  const deletedFoodItem = await FoodItem.findByIdAndDelete(req.params.foodId);
  if (!deletedFoodItem) {
    return next(new ErrorHandler('No document found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
  });
});
