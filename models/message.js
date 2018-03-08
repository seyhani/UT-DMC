var mongoose = require("mongoose");
var middleware = require("../middleware/index");

var MessageSchema = new mongoose.Schema({
    title:String,
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    replies:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }],
    content:String
});


MessageSchema.virtuals("replyed").get(function () {
   return replies.length > 0;
});
module.exports = mongoose.model("Message", MessageSchema);
