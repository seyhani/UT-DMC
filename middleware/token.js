var jwt = require('jwt-simple');
var payload = { foo: 'bar' };
var secret = 'Rebelion';
var _ = require("lodash");
var expireLenght = 60*60*1000;
module.exports = {
    setToken: function(user){
        user.resetPasswordExpires = Date.now() + expireLenght;
        return jwt.encode(user, secret);
    },
    decodeToken : function (token) {
        return jwt.decode(token, secret);
    }
};