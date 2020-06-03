var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
const cors = require('cors');



var MongoStore = require('connect-mongo')(session);
app.set('view engine', 'ejs');
//connect to MongoDB
var mongoDB='mongodb+srv://dbuser:dbkey@myclouddb-arw5e.mongodb.net/test?retryWrites=true&w=majority'
mongoose.connect(mongoDB, { useNewUrlParser: true });
var db = mongoose.connection;
mongoose.set('useFindAndModify', false);
//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  // we're connected!
});

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors({
  origin: 'http://localhost:8080'
}));


// serve static files from template
app.use(express.static('public'));

// include routes
var routes = require('./routes/router');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message);
});

// listen on port 3000
app.listen(process.env.PORT || 3000, function () {
  console.log('Express app listening on port 3000');
});