var jwt = require('jwt-simple');
var payload = { foo: 'bar' };
var secret = 'Rebelion';
var _ = require("lodash");
var crypto = require('crypto');
var expireLenght = 60*60*1000;
module.exports = {
    generateToken: function (lenght) {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < lenght; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    setToken: function(user){
        user.resetPasswordExpires = Date.now() + expireLenght;
        return jwt.encode(user, secret);
    },
    decodeToken : function (token) {
        return jwt.decode(token, secret);
    }
};