$(document).ready(function(){
	d = 300;
	$(".navbar-toggle").click(function(event) {
		target = $(this).data('target');
		tclass = $(this).data('toggle');
		if($(target).hasClass(tclass)){
			$(target).toggleClass(tclass);
			h = $(target).height();
			$(target).css("opacity", 0);
			$(target).css("height", 0);
			$(target).animate({"opacity": 1, height: h + "px"}, d, function(){
				$(target).css("height", "");
			});
		}
		else{
			$(target).css("opacity", 1);
			$(target).css("height", $(target).height());
			$(target).animate({"opacity": 0, height: 0}, d, function(){
				$(target).toggleClass(tclass);
				$(target).css("height", "");
			});
		}
	});
});