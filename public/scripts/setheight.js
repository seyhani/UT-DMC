$(document).ready(function(){
	function max(a, b){
		return a > b ? a : b
	}
	a = $('div.tag').height();
	b = $('div.pbd').height();
	c = max(a, b);
	$('div.tag').height(c);
	$('div.pbd').height(c);
});