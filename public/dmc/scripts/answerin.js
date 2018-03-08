$(document).ready(function(){
    $("input[value='open']").click(function() {
    	$(".answerin").animate({opacity: 0, height: 0}, 200, function(){
    		$(this).css({opacity: "", height: ""});
    		$(this).addClass("hide");
    	});
    });
    $("input[value='close']").click(function() {
        $(".answerin").removeClass("hide").css({opacity: 0, height: 0});;
        $(".answerin").animate({opacity: 1, height: "30px"}, 200, function(){
    		$(this).css({opacity: "", height: ""});
    	});
    });
});