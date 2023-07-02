const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
// Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subcategory',
  }],
});

// Sub-category schema
const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }
,
  workers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker'
  }], image: {
    type: String,
    required: true,
  },
});

// Define models based on the schemas
const Category = mongoose.model('Category', categorySchema);
const Subcategory = mongoose.model('Subcategory', subcategorySchema);


module.exports = {Category,Subcategory};