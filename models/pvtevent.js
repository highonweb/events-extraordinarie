var mongoose = require('mongoose');
var User = require('../models/user');
var pvtEventSchema = new mongoose.Schema(
  {
    "title": {
      "type": "String"
    },
    "font": {
      "type": "String"
    },
    "bgcolor": {
      "type": "String"
    },
    "deadline": {
      "type": "Date"
    },
    "content": {
      "type": "String"
    },
    "footer": {
      "type": "String"
    },
    "location": {
      "type": "String"
    },
    "startDate": {
      "type": "Date"
    },
    "createdby": {
      "type": mongoose.Schema.Types.ObjectId,
      "ref": 'User'
    },
    "endDate": {
      "type": "Date"
    },
    "attendees": {
      "type": [{
        "type" : mongoose.Schema.Types.ObjectId,
        "ref" : 'User'
      }
      ]
    }
  }
);

var pvtEvent = mongoose.model('pvtEvent', pvtEventSchema);
module.exports = pvtEvent;
