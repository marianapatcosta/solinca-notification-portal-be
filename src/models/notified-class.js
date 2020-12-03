const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const notifiedClassSchema = new Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  notificationDate: { type: Date, required: true },
  classDescription: { type: String, required: true }
});

module.exports = mongoose.model("NotifiedClass", notifiedClassSchema);
