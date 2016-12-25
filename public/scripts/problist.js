var options = {
    valueNames: [ 'problemname','tags' ]
};

var hackerList = new List('puzzles_list', options);

function tagfilter(item, tag){
	return item.values().tags.indexOf(tag) > -1;
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