'use strict';
const express           = require("express"),
    router              = express.Router(),
    app                 = express(),
    path                = require('path'),
    bodyParser          = require("body-parser"),
    mongoose            = require("mongoose"),
    passport            = require("passport"),
    cookieParser        = require("cookie-parser"),
    LocalStrategy       = require("passport-local"),
    flash               = require("connect-flash"),
    session             = require("express-session"),
    methodOverride      = require("method-override"),
    middleware          = require("./middleware/index"),
    User                = require("./models/user"),
    Rule                = require("./models/rule"),
    Problem             = require('./models/problem'),
    Puzzle              = require('./models/puzzle'),
    Clar                = require('./models/clar'),
    groupRoutes         = require("./routes/group"),
    dashboardRoutes     = require("./routes/dashboard"),
    adminRoutes         = require("./routes/admin"),
    problemRoutes       = require("./routes/problems"),
    tagRoutes           = require("./routes/tag"),
    indexRoutes         = require("./routes/index"),
    competitionRoutes   = require("./routes/competition"),
    userRoutes          = require("./routes/user"),
    globalConfig        = require("./config/global"),
    clarRoutes          = require("./routes/clar");

globalConfig.init();
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost/DMC");


//public/Files/Problems/
///Files/Problems/sadegh/Sources/Homework 15 F95.pdf
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
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

app.use(function(req, res, next){
    //app.locals.currentUser = req.user;
    res.locals.baseURL  = baseURL;
    // console.log("PRE:" + req.url);
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});
app.use( (req, res, next) => {
    let probsPath = `${baseURL}/Files/Problems/`;
    // if(new RegExp(`^` + probsPath).test(req.url)) {
    //     if(!req.user)
    //         return middleware.dmcRedirect(res, '/');
    //     if(req.user.isAdmin)
    //         return next();
    //     if(!req.user.group)
    //         return middleware.dmcRedirect(res, '/');
    //
    //     let probName = [].concat(req.url.replace(probsPath, ``).split(`/`));
    //     if(probName.length > 1 && !req.user.isAdmin && probName[1] != `Sources`)
    //         return middleware.dmcRedirect(res, '/');
    //     console.log(probName[0]);
    //     probName[0] = probName[0].split(`%20`).join(` `);
    //     console.log(probName[0]);
    //     Problem.findOne({name: probName[0]}, (err, prob) => {
    //         if(err || !prob)
    //             return middleware.dmcRedirect(res, '/');
    //         Puzzle.findOne({problem: prob, group: req.user.group}, (err, puzzle) => {
    //             if(err || !puzzle || puzzle.new)
    //                 return middleware.dmcRedirect(res, '/');
    //             next();
    //         })
    //     });
    // }
    // else
        next();
});
app.use(express.static(__dirname + "/public"));
////
var baseUrlLocal = "";


app.use(baseUrlLocal+"/", indexRoutes);
// app.use(baseUrlLocal+"/forum", forumRoutes);
app.use(baseUrlLocal+"/admin/", adminRoutes);
app.use(baseUrlLocal+"/clar/", clarRoutes);
app.use(baseUrlLocal+"/dashboard/", dashboardRoutes);
app.use(baseUrlLocal+"/admin/", groupRoutes);
app.use(baseUrlLocal+"/admin/", competitionRoutes);
app.use(baseUrlLocal+"/admin/users", userRoutes);
app.use(baseUrlLocal+"/admin/problems", problemRoutes);
app.use(baseUrlLocal+"/admin/tags", tagRoutes);

// Rule.findOne({name:"DMC"}).exec(function (err,rule) {
//     console.log(rule);
//     if(rule)
//        rule.remove();
//     Rule.create({name:"DMC",startDate: new Date(2017,0,18,14),duration:3600*8000});
// });

Rule.findOne({name:"DMC"}).exec(function (err,rule) {
    if(!rule)
        Rule.create({name:"DMC",startDate: new Date(2017,0,18,14),duration:360000*8000});
    else
        console.log(rule);
});

app.use((req, res, next) => {
    req.flash(`error`, `Sorry cant find that:   `+req.url);
    return middleware.dmcRedirect(res, '/');
});

let server = app.listen(3042, function () {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`Survey listening at http://${host}:${port}`);
});
