var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    session = require("express-session"),
    seedDB      = require("./seeds"),
    methodOverride = require("method-override");
    var SMTPServer = require('smtp-server').SMTPServer;
    var smtpTransport = require('nodemailer-smtp-transport');
    var directTransport = require('nodemailer-direct-transport');
    var nodemailer = require('nodemailer');
mongoose.Promise = global.Promise;
var server = new SMTPServer({allowInsecureAuth:true, onAuth: function(auth, session, callback){
    // if(auth.username !== 'abc' || auth.password !== 'def'){
    //     return callback(new Error('Invalid username or password' + auth.user));
    // }
    callback(null, {user: 123}); // where 123 is the user id or similar property
}});
    server.listen(1567);
var transporter = nodemailer.createTransport({
    port:1567,
    auth:{
        username: 'abc',
        password: 'def'
    },
    tls:{
        rejectUnauthorized: false
    }

});
var mailOptions = {
    from: '"Fred Foo" <ahsprim@gmail.com>', // sender address
    to: "ahsprim@gmail.com", // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
};

// // send mail with defined transport object
// transporter.sendMail(mailOptions, function(error, info){
//     if(error){
//         return console.log(error);
//     }
//     console.log('Message sent: ' + info.response);
// });
transporter.close();
//requiring routes
var groupRoutes    = require("./routes/group"),
    dashboardRoutes    = require("./routes/dashboard"),
    adminRoutes    = require("./routes/admin"),
    problemRoutes = require("./routes/problems"),
    indexRoutes      = require("./routes/index");
    userRoutes      = require("./routes/user");
    
mongoose.connect("mongodb://localhost/MystryHunt");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));


// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});


app.use("/", indexRoutes);
app.use("/admin/", groupRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/users", userRoutes);
app.use("/admin/problems", problemRoutes);

app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

var server = app.listen(3002, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Survey listening at http://%s:%s', host, port);
});
