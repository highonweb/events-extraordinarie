var mongoose = require('mongoose');
var User = require('../models/user');
var quikSchema = new mongoose.Schema(
  {
    "title": {
      "type": "String"
    },
    "template": {
      "type": "String"
    },
    "sperson": {
      "type": "String"
    },
    "footer": {
      "type": "String"
    },
    "location": {
      "type": "String"
    },
    "Date": {
      "type": "Date"
    },
    "createdby": {
      "type": mongoose.Schema.Types.ObjectId,
      "ref": 'User'
    },
    

  }
);

var quik = mongoose.model('quik', quikSchema);
module.exports = quik;
