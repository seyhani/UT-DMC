
var fs = require('fs');
function deleteFolderRecursive (path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
function mkdir(dir) {
    if (!fs.existsSync(dir))fs.mkdirSync(dir);
}
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
    hashAnswer: function(answer,hashIndex)
    {
        var text = "";
        var possible = "CMuUfNXYko7fIzHLOwQQWOcoifsBFkSlS4L6sEDxRIVMt9aptrnHEtIuK8drVnGOJUpiZeBTJCvX42m29WTg4PJForglANgiVD72";

        for( var i=0; i < lenght; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    makeSecret: function(lenght)
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < lenght; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },

    initialProblemDirectories : function (problemName) {
        var dir = "Files/Problems/";
        dir += problemName;
        mkdir(dir);
        dir += "/";
        mkdir(dir+"Submissions");
        mkdir(dir+"Sources");

    },
    removeProblemDirectories :function (problemName) {
        deleteFolderRecursive("Files/Problems/"+problemName);
    },
    uploadToDir:function (tmp_path,folder_name,file_name) {
        var target_path =  folder_name + '/' + file_name;
        fs.rename(tmp_path, target_path, function (err) {
            if (err) throw err;
            fs.unlink(tmp_path, function () {
                if (err) throw err;
            });
        });
    }
};