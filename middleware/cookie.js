var jwt = require('jwt-simple');
var payload = { foo: 'bar' };
var secret = 'Rebelion';
var _ = require("lodash");
var crypto = require('crypto');
var expireLenght = 60*60*1000;
module.exports = {
    getCookie:function (req,cname)
    {
        var name = cname + "=";
        var ca = req.headers.cookie.split(';');
        for(var i=0; i<ca.length; i++)
        {
            var c = ca[i].trim();
            if (c.indexOf(name)==0) return c.substring(name.length,c.length);
        }
        return "";
    },
    setCookie:function (req,cname,cvalue,exdays)
    {
        var d = new Date();
        d.setTime(d.getTime()+(exdays*24*60*60*1000));
        var expires = "expires="+d.toGMTString();
        req.headers.cookie = cname + "=" + cvalue + "; " + expires;
    }
};
