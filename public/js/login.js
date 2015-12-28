$(function(){
	$("#button-connect").on("click",function(){
		$("form").submit();
	});
	
	$("form").keypress(function(e) {
		if(e.which == 13) {
			$("form").submit();
		}
	});
});