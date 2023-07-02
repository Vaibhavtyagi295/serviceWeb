const mongoose = require("mongoose");
const plm = require("passport-local-mongoose")
mongoose.set('strictQuery',true);
mongoose.connect("mongodb+srv://vaibhav:aman@cluster0.il74hmr.mongodb.net/Ecommerce?retryWrites=true&w=majority")
.then(function(){
  console.log("hello world")
});

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  image: String,
  contactNumber: String,
  email: String,
  role: {
    type: String,
    enum: ["admin", "worker","user"],
    default: "user"
  }
});


userSchema.plugin(plm);

module.exports = mongoose.model("user",userSchema)