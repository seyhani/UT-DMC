var express     = require("express"),
    router  = express.Router(),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    session = require("express-session"),
    middleware = require("./middleware/index"),
    methodOverride = require("method-override");

mongoose.Promise = global.Promise;

var groupRoutes    = require("./routes/group"),
    dashboardRoutes    = require("./routes/dashboard"),
    adminRoutes    = require("./routes/admin"),
    problemRoutes = require("./routes/problems"),
    tagRoutes = require("./routes/tag"),
    indexRoutes      = require("./routes/index"),
    User = require("./models/user"),
    competitionRoutes = require("./routes/competition"),
    userRoutes      = require("./routes/user");

mongoose.connect("mongodb://localhost/DMC");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Devil May Cry",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

require('./config/passport')(passport);

// var baseURL = "/dmc";
var baseURL = "";

app.use(function(req, res, next){
    app.locals.currentUser = req.user;
    // res.locals.baseURL  = "/dmc";
    res.locals.baseURL  = baseURL;
    // console.log("PRE:" + req.url);
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use(baseURL+"/", indexRoutes);
app.use(baseURL+"/admin/", groupRoutes);
app.use(baseURL+"/admin/", competitionRoutes);
app.use(baseURL+"/dashboard/", dashboardRoutes);
app.use(baseURL+"/admin/", adminRoutes);
app.use(baseURL+"/admin/users", userRoutes);
app.use(baseURL+"/admin/problems", problemRoutes);
app.use(baseURL+"/admin/tags", tagRoutes);

app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that:   '+req.url);
});

var server = app.listen(3042, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Survey listening at http://%s:%s', host, port);
});
