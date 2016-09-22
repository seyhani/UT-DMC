
var fs = require('fs');
module.exports = {
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    },
    havePermission: function(req, res, next){
        if(req.user.isAdmin){
            return next();
        }
        req.flash("error", "you have not permission!");
        res.redirect("/");
    },
    makeSecret: function(lenght)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < lenght; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    uploadToDir:function (tmp_path,folder_name,file_name) {
        var target_path = './public/Uploads/Files/' + folder_name + '/' + file_name;
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            fs.unlink(tmp_path, function () {
                if (err) throw err;
            });
        });
    }
}