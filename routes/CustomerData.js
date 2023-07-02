const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
