const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      trime: true,
      uppercase: true,
      required: 'Name is required',
      minlnegth: [6, 'Too short'],
      maxlength: [12, 'Too long'],
    },
    expiry: {
      type: Date,
      required: true,
    },
    discount: {
      type: Number,
      required: true,
    },
  },

  { timestamps: true }
);

module.exports = mongoose.model('Coupon', couponSchema);
