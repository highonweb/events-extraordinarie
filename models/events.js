var mongoose = require('mongoose');
var User = require('../models/user');
var EventSchema = new mongoose.Schema(
  {
    "title": {
      "type": "String"
    },
    "content": {
      "type": "String"
    },
    "font": {
      "type": "String"
    },
    "img": {
      "type": "buffer"
    },
    "align": {
      "type": "String"
    },
    "bgcolor": {
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
    "deadline": {
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
      }]
    },
    "came": {
      "type": [{
        "type" : String,
      }]
    }
  }
);

var Event = mongoose.model('Event', EventSchema);
module.exports = Event;
