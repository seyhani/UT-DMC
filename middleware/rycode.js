var _ = require("lodash");
module.exports = {
    encode: function(arr){
        var newpass = [];
        var pass = "";
        if(arr.length < 10)
            return pass;
        for(var key in arr) {
            newpass.push(arr[key]);
        }
        var uniq = _.uniq(newpass, function(x){
            return x;
        });
        newpass  = newpass.map(function (item ,index) {
            return uniq.indexOf(item);
        });
        for(var key in newpass) {
            pass += newpass[key];
        }
        return pass;
    },
};