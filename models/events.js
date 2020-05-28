var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    header: {
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    content: {
      type: String,
      unique:true,
      required: true,
    },
    footer: {
      type: String,
      required: true,
    }
  });
  