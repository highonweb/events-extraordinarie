var express = require('express');
var router = express.Router();
var User = require('../models/user');
var Event = require('../models/events');
var pvtEvent = require('../models/pvtevent');

// GET route for reading data
router.get('/', function (req, res, next) {
  
  return res.render('index');
});

//POST route for updating data
router.post('/', function (req, res, next) {
  // confirm that user typed same password twice
  if (req.body.password !== req.body.passwordconf) {
    var err = new Error('Passwords do not match.');
    err.status = 400;
    res.send("passwords dont match");
    return next(err);
  }


  if (req.body.username &&
    req.body.password &&
    req.body.passwordconf) {

    var userData = {
      username: req.body.username,
      password: req.body.password,
      passwordconf: req.body.password,
      email: req.body.email,
    }


    User.create(userData, function (error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/home');
      }
    });

  } else if (req.body.logusername && req.body.logpassword) {
    User.authenticate(req.body.logusername, req.body.logpassword, function (error, user) {
      if (error || !user) {
        var err = new Error('Wrong username or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        req.body.logusername = user.username
        return res.redirect('/home');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
})

router.post('/newpvtinvite' ,function (req, res, next ) {
  User.findById(req.session.userId)
  .exec(function (error, user){
    var eventData = {

      title: req.body.title,
      location: req.body.location,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      content: req.body.content,
      footer: req.body.footer,
      createdby: user,
    }
        var rec = req.body.recepients.split(' ')
        console.log(rec)
        pvtEvent.create(eventData, function (error, pvtEvent){
          User.findOneAndUpdate({_id: req.session.userId},{$push:{mypvtevents:pvtEvent}}, function (err,event){})
          console.log(user.myevents)
          for (var i = 0; i < rec.length; i++){
            User.findOneAndUpdate({ username: rec[i]}, {$push:{pvtevents: pvtEvent}}, function (err,event){});
            }}
        );
////////////////////////////////////////////////////////////////////////////////////////////////

        return res.redirect('/home');
      })
    });

router.post('/newinvite' ,function (req, res, next ) {
  User.findById(req.session.userId).exec(function (error, user){
    console.log('New invite')
    var eventData = {
    title: req.body.title,
    location: req.body.location,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    content: req.body.content,
    footer: req.body.footer,
    createdby: user,
}
      console.log("Event object created")
    Event.create(eventData, function (error, event) {
      if (error) {
        return next(error);
      } else {
        User.findOneAndUpdate({_id: req.session.userId},{$push:{myevents:event}}, function (err,event){ console.log(event)})
        return res.redirect('/home');
      }
    })

})
})
router.get('/invite/:id', function (req,res,next){
  Event.findById(req.params.id).exec(function(error, pvtevent){
    res.render('invite' ,{event: pvtevent})
  }
  )
})
router.get('/pvtinvite/:id', function (req,res,next){
  pvtEvent.findById(req.params.id).exec(function(error, event){
    res.render('pvtinvite' ,{event: event})
  }
  )
})
router.get('/accept/:id', function (req,res, next){
User.findById(req.session.userId).exec(function (error,user){
  var result = Event.findOneAndUpdate({_id: req.params.id},{$push:{attendees:user}}, function (err,event){
    console.log('gggggggg'+String(err))
    User.update(
      { _id: user._id }, 
      { $push: { ainvites: event } },
      function(err,user){

      }
  );
  })
})
  res.redirect('/home')
})
router.get('/acceptpvt/:id', function (req,res, next){
  User.findById(req.session.userId).exec(function (error,user){
    var result = pvtEvent.findOneAndUpdate({_id: req.params.id},{$push:{attendees:user}}, function (err,event){     
      console.log('gggggggg'+String(err))
    User.update(
      { _id: user._id }, 
      { $push: { apinvites: event } },
      function(err,user){

      }
  ); })
  }
    )
    res.redirect('/home')
  })
  


// GET route after registering
router.get('/home', function (req, res, next) {
  User.findById(req.session.userId).populate({path : 'mypvtevents' , Model:pvtEvent,  populate : {path : 'attendees', Model:User} }).populate({path : 'myevents' , Model:Event, populate : {path : 'attendees', Model:User}})
  .populate({path : 'pvtevents' , Model:pvtEvent})
  .populate({path : 'ainvites' , Model:Event})
  .populate({path : 'apinvites' , Model:pvtEvent})
    .exec(function (error, user) {
      Event.find()
      .exec(function (error,events) {
        if (error) {
          return next(error);events
        } else {
          if (user === null) {
            var err = new Error('Reload it if you just Logged in</br>PS:Its for security purposes');
            err.status = 400;
            return next(err);
          } else {
            console.log(user.apinvites)
            return res.render('home',{user: user,events: events } )
          }
        }
      })
     
    });
});

// GET for logout logout
router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

module.exports = router;