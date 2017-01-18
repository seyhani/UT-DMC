$(document).ready(function(){
    var allSubmissionCount = 0, newAllSubmissionCount;
    function setNewAllSubmissionCount(func = function(){}){
        $.get(baseURL + "/admin/competition/count", function(data){
            newAllSubmissionCount = data["newAllSubmissionCount"];
            func();
        });
    }
    function checkNewAllSubmissionCount(){
        setNewAllSubmissionCount();
        if(newAllSubmissionCount != allSubmissionCount){
            location.reload();
        }
    }
    setNewAllSubmissionCount(function(){
        allSubmissionCount = newAllSubmissionCount;
    });
    setInterval(function(){
        checkNewAllSubmissionCount();
    }, 5000);
});