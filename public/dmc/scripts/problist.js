var options = {
    valueNames: [ 'problemname','tags' ]
};

var hackerList = new List('puzzles_list', options);

function tagfilter(item, tag){
	return item.values().tags.indexOf(tag) > -1;
}

function tagsearch(){
	hackerList.filter(function(item){
		flag = true;
		$(".tagsearchbtn.active").each(function(index, el) {
			if(item.values().tags.indexOf($(el).text()) < 0)
				flag = false;
		});
		return flag;
	});
}

$(document).ready(function(){
	$(".taglist li a").each(function(index, el) {
		$(this).click(function() {
			$(".taglist li a").removeClass('active');
			$(this).addClass('active');
			if(index)
				hackerList.filter(function(item){
					return tagfilter(item, $(el).text());
				});
			else
				hackerList.filter();
		});
	});
	$(".tagsearchbtn").click(function(){
		if(!$(this).hasClass("active")){
			$(this).parents(".tagsearchgp").find(".tagsearchbtn").removeClass("active");
			$(this).addClass("active");
		}
		else
			$(this).removeClass("active");
		tagsearch();
	});
	$(".alltagsearchbtn").click(function(){
		$(".tagsearchbtn").removeClass("active");
		hackerList.filter();
	});
});