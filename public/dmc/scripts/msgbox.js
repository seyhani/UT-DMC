$(document).ready(function(){
	$("#msgok").click(function(event) {
		$(".msgbox").animate({opacity: 0}, 300, function(){
			$(".msgbox").addClass("hide").css("opacity", "");
		});
	});
});