var express = require('express');
var router = express.Router();
var User = require('../models/user');
var subscriptions = require('../models/subscription');
var Event = require('../models/events');
var pvtEvent = require('../models/pvtevent');
var Eventuser = require('../models/event-user');
var pvtEventuser = require('../models/pvtevent-user');
const webpush = require('web-push');
var nodemailer = require('nodemailer');
var fs = require('fs');
const multer = require('multer');
var upload = multer({ dest: 'uploads/' })


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'eventsextraordinaire2020@gmail.com',
    pass: 'delta2020'
  }
});
const publicVapidKey = 'BIJFjOvC8wohJdhk8jDR1bdxrzScskN7ulc5liCldQoCFibQ5Z7lijGikDfdw5eEXfYTUdcuuCczfMQrrvpS77Q';
const privateVapidKey = 'VYgLScLUQAW3fHS1YBCA-szoDyaBZtg38WS2wcssuKg';
 
webpush.setVapidDetails('mailto:ms2k1@gmail.com', publicVapidKey, privateVapidKey);
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

router.post('/newpvtinvite',upload.single('img') ,function (req, res, next ) {
  User.findById(req.session.userId)
  .exec(function (error, user){
    console.log(req.body)
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    var image =  new Buffer(encode_image, 'base64')
    var eventData = {
      title: req.body.title,
      font: req.body.font,
      img: image,
      align: req.body.align,
      bgcolor: req.body.bgcolor,
      deadline: req.body.deadline,
      location: req.body.location,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      content: req.body.content,
      footer: req.body.footer,
      createdby: user,
    }
   

        var rec = req.body.recepients.split(' ')
        
        pvtEvent.create(eventData, function (error, pvtEvent){
          User.findOneAndUpdate({_id: req.session.userId},{$push:{mypvtevents:pvtEvent}}, function (err,user){})
          for (var i = 0; i < rec.length; i++){
            User.findOneAndUpdate({ username: rec[i]}, {$push:{pvtevents: pvtEvent}}, async function (err,user){
              console.log(user);
              subscriptions.findOne({user:String(user._id)}).exec(function (err,sub){

                const payload = JSON.stringify({ title: pvtEvent.title , body: 'You received a new private invite' });
              console.log(sub.subscribe)
              webpush.sendNotification(JSON.parse(sub.subscribe), payload);

              })
              
              var mailOptions = {
                from: 'eventsextraordinaire2020@gmail.com',
                to: user.email,
                subject: pvtEvent.title,
                text: 'localhost:3000/pvtinvite/'+pvtEvent.id
              };
              transporter.sendMail(mailOptions)
            });
            
            }}
        );
////////////////////////////////////////////////////////////////////////////////////////////////

        return res.redirect('/home');
      })
    });

    
router.post('/newinvite',upload.single('img')  ,function (req, res, next ) {
  User.findById(req.session.userId).exec(function (error, user){
    console.log('New invite')
    var img = fs.readFileSync(req.file.path);
    var encode_image = img.toString('base64');
    var image =  new Buffer(encode_image, 'base64')
    var eventData = {
    title: req.body.title,
    font: req.body.font,
    img: image,
    align: req.body.align,
    bgcolor: req.body.bgcolor,
    deadline: req.body.deadline,
    location: req.body.location,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    content: req.body.content,
    footer: req.body.footer,
    createdby: user,
}
      console.log("Event object created")
    Event.create(eventData, async function (error, event) {
      if (error) {
        return next(error);
      } else {
        console.log(event)
        const users = await User.find({})
        for (const user of users) {
          console.log(user);
          subscriptions.findOne({user:String(user._id)}).exec(function (err,sub){
      if(sub != undefined){
            const payload = JSON.stringify({ title: event.title , body: 'You received a new invite' });
          console.log(sub.subscribe)
          webpush.sendNotification(JSON.parse(sub.subscribe), payload);
          }
        })}
        User.findOneAndUpdate({_id: req.session.userId},{$push:{myevents:event}},async function (err,user){
          
        })
        
        return res.redirect('/home');
      }
    })

})
})

router.get('/invite/:id', function (req,res,next){
  Event.findById(req.params.id).exec(function(error, event){
    res.render('invite' ,{event: event})
  }
  )})
  router.get('/cancel/:id', function (req,res,next){
    Event.findById(req.params.id).remove().exec()
    res.redirect('/home')
})
router.get('/cancelpvt/:id', function (req,res,next){
  pvtEvent.findById(req.params.id).remove().exec()
  res.redirect('/home')
})
router.get('/pvtinvite/:id', function (req,res,next){
  pvtEvent.findById(req.params.id).exec(function(error, event){
    res.render('pvtinvite' ,{event: event})
  }
  )
})
router.post('/accept/:id', function (req,res, next){
User.findById(req.session.userId).exec(function (error,user){
  var result = Event.findOneAndUpdate({_id: req.params.id},{$push:{attendees:user}},async function (err,event){
    
    User.update(
      { _id: user._id }, 
      { $push: { ainvites: event } }, function (err,event){console.log(err)})
        var data = {
          "event": event,
          "user": user,
          "comingwith": req.body.coattendees,
          "meal": req.body.pref,
        } ;
        Eventuser.create(data)
      
  
  })
})
  res.redirect('/home')
})
router.post('/acceptpvt/:id', function (req,res, next){
  User.findById(req.session.userId).exec(function (error,user){
    var result = pvtEvent.findOneAndUpdate({_id: req.params.id},{$push:{attendees:user}}, function (err,event){     
    User.update(
      { _id: user._id }, 
      { $push: { apinvites: event } }, function (err,event){console.log(err)})
      var data = {
        "event": event,
        "user": user,
        "comingwith": req.body.coattendees,
        "meal": req.body.pref,
      } ;
      pvtEventuser.create(data)
    })
  })
    res.redirect('/home')
  })
  
  router.get('/attendancepvt/:id', function (req,res, next){
    console.log(req.params.id)
    pvtEvent.findById(req.params.id).exec(async function (err,pvtevent){
      console.log(pvtevent)
      pvtEventuser.find({event: pvtevent}).populate({path : 'user', Model:User})
      .exec((error,pevent)=>{
        res.render('attendance',{pevent:pevent,event:pvtevent})
/////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
      })   


    })
  })


  router.get('/attendance/:id', function (req,res, next){
    Event.findById(req.params.id).exec(async function (err,event){
      Eventuser.find({event: event}).populate({path : 'user', Model:User})
      .exec((error,pevent)=>{
        res.render('attendance',{pevent:pevent,event:event})
/////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
      })   


    })
  })
    

// GET route after registering
router.get('/home', function (req, res, next) {
  User.findById(req.session.userId).populate({path : 'mypvtevents' , Model:pvtEvent})
  .populate({path : 'myevents' , Model:Event})
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
            var today = new Date();
            for (let index = 0; index < events.length; index++) {
              if (events[index].deadline<today) {
                result=Event.find({title : events[index].title}).remove().exec();
              }
              
            }
            var today = new Date();
            for (let index = 0; index < user.pvtevents.length; index++) {
              if (user.pvtevents[index].deadline<today) {
                result=pvtEvent.find({title:user.pvtevents[index].title}).remove().exec();
              }
              
            }

            return res.render('home',{user: user,events: events } )
          }

        }
      })
     
    });
});
router.post('/subscribe', async (req, res) => {
  
 const user = await User.findById(req.session.userId)
  const subscriptionn = JSON.stringify(req.body);
  var subdata = {
    subscribe:subscriptionn,
    user:user._id,
    //////////////////////////////////////////////////////////////////////////////////////////////
  }
  
 subscriptions.create(subdata)
  res.sendStatus(200);
     const payload = JSON.stringify({ title: `Hello!`, body: 'world' });
    webpush.sendNotification(JSON.parse(subscriptionn), payload);
  
}
 
);
router.get('/info/:id', (req,res,next) => {

      Event.findById(req.params.id).exec(async (error, event)=>{
        
        Eventuser.find({event: await event})
        .populate({path :'user', Model:User})
        .populate({path :'event', Model:Event})
        .exec((err,evuser)=>{
          console.log(evuser)
          return res.render("info",{info:evuser});
        }
        
      )})
      

})
router.get('/infopvt/:id', (req,res,next) => {

  pvtEvent.findById(req.params.id).exec(async (error, event)=>{
    
    pvtEventuser.find({event: await event})//.populate({path :'user', Model:User}).populate({path :'event', Model:Event}).
    .exec((err,evuser)=>{
      console.log(evuser)
      return res.render("info",{info:evuser});
    }
    
  )})
  

})

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


router.get('/came/:name/:id', function (req, res, next) {
  Event.findByIdAndUpdate(req.params.id,{$push:{came:req.params.name}}).exec(
    function (err,data) {
      if(data == null){
        pvtEvent.findByIdAndUpdate(req.params.id,{$push:{came:req.params.name}}).exec()
  res.redirect('/attendancepvt/'+req.params.id)

      }
      else {
        res.redirect('/attendance/'+req.params.id)
      }
    }
  )
  
})

module.exports = router;

