const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
const plm = require("passport-local-mongoose")
const workerSchema = new mongoose.Schema({
  username:String,
  location: String,
  number: String,
  password:String,
  categories: [String],
  subcategory: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Subcategory',
    required: true
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory'
  }],
  image: {
    type: String,},
  workDescription: String,approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviews: [{
    rating: {
      type: Number,
    },
    comment: {
      type: String,
    },
    name: {
      type: String,
    },
    mobileNumber: {
      type: String,
    }
  }]

});

workerSchema.plugin(plm);

module.exports = mongoose.model('Worker', workerSchema);
