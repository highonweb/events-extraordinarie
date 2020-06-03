var mongoose = require('mongoose');
var User = require('../models/user');
var Event = require('../models/events');
var CombSchema = new mongoose.Schema(
    {
        "event": {
          "type": mongoose.Schema.Types.ObjectId,
          "ref": Event
        },
        "user": {
            "type": mongoose.Schema.Types.ObjectId,
            "ref": User
        },
        "comingwith": {
            "type": 'number'
        },
        "meal": {
            "type": 'string'
        },

    });
    var Eventuser = mongoose.model('Eventuser', CombSchema);
module.exports = Eventuser;