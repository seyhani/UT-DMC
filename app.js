var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    session = require("express-session"),
    methodOverride = require("method-override");

mongoose.Promise = global.Promise;

var groupRoutes    = require("./routes/group"),
    dashboardRoutes    = require("./routes/dashboard"),
    adminRoutes    = require("./routes/admin"),
    problemRoutes = require("./routes/problems"),
    indexRoutes      = require("./routes/index"),
    User = require("./models/user"),
    competitionRoutes = require("./routes/competition"),
    userRoutes      = require("./routes/user");

mongoose.connect("mongodb://localhost/MystryHuntTest");

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

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);

app.use(function(req, res, next){
    if(req.user)
    {
        User.find(req.user._id).deepPopulate(["group","group.competition"]).exec(function (err,user) {
            res.locals.currentUser = user;
            res.locals.success = req.flash('success');
            res.locals.error = req.flash('error');
            next();
        })
    }
    else{
        res.locals.currentUser = req.user;
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        next();
    }

});


app.use("/", indexRoutes);
app.use("/admin/", groupRoutes);
app.use("/admin/", competitionRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/admin/", adminRoutes);
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
