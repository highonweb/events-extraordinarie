var mongoose = require('mongoose');
var User = require('../models/user');
var pvtEvent = require('../models/events');
var CombSchema = new mongoose.Schema(
    {
        "event": {
          "type": mongoose.Schema.Types.ObjectId,
          "ref": pvtEvent
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
    var pvtEventuser = mongoose.model('pvtEventuser', CombSchema);
module.exports = pvtEventuser;