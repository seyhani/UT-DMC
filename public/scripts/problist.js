var options = {
    valueNames: [ 'problemname','tag' ]
};

var hackerList = new List('puzzles_list', options);

function tagfilter(item, tag){
	return item.values().tag.indexOf(tag) > -1;
}

$(document).ready(function(){
	$(".taglist li a").each(function(index, el) {
		$(this).click(function() {
			if(index)
				hackerList.filter(function(item){
					return tagfilter(item, $(el).text());
				});
			else
				hackerList.filter();
		});
	});
});