
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter the restaurant name'],
    trim: true,
    maxLength: [100, 'Restaurant name cannot exceed 100 characters'],
  },
  isVeg: { type: Boolean, default: false },
  address: {
    type: String,
    required: [true, 'Please enter the restaurant address'],
  },
  ratings: { type: Number, default: 0 },
  numOfReviews: { type: Number, default: 0 },
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  reviews: [
    {
      name: { type: String, required: true },
      rating: { type: Number, required: true },
      Comment: { type: String, required: true },
    },
  ],
  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ address: 'text' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
