const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  solincaAuth: { type: String, required: true },
  phoneNumber: { type: String },
  selectedClubs: [{ id: Number, brand: String, name: String }],
  classesToTrack: [{ type: String }],
  solincaAuthToken: { type: String },
  isWatcherOn: { type: Boolean, default: false },
  notificationTypes: [{ type: String }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
