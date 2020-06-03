var mongoose = require('mongoose');
var User = require('../models/user');
var subSchema = new mongoose.Schema(
    {
        "user":{
            type: String
                },
        "subscribe":{
            type:String
        },
    });
    var subscription = mongoose.model('subscription', subSchema);
module.exports = subscription;
