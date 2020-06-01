var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var pvtEvent = require('../models/pvtevent');
var Event = require('../models/events')
var UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  email: {
    type: String,
    unique:true,
    required: true,
    match: /\S+@\S+\.\S+/,
  },
  password: {
    type: String,
    required: true,
  },
  passwordconf: {
    type: String,
    required: true,
  },
  myevents: {
    type :[{
      "type" : mongoose.Schema.Types.ObjectId,
    }]
  },
  ainvites: {
    type :[{
      "type" : mongoose.Schema.Types.ObjectId,
      "ref" : Event,
    }]
  },
  apinvites: {
    type :[{
      "type" : mongoose.Schema.Types.ObjectId,
      "ref" : pvtEvent,
    }]
  },
  pvtevents: {
    type :[{
      "type" : mongoose.Schema.Types.ObjectId,
    "ref" : pvtEvent
    }]
  },
  mypvtevents: {
    type :[{
      "type" : mongoose.Schema.Types.ObjectId,
    "ref" : pvtEvent
    }]
  }
});
//authenticate input against database
UserSchema.statics.authenticate = function (username, password, callback) {
  User.findOne({ username: username })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = new Error('User not found.');
        err.status = 401;
        return callback(err);
      }
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null, user);
        } else {
          return callback();
        }
      })
    });
}

//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;

