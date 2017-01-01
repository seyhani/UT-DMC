$(document).ready(function(){
	$("input[type='file']").change(function(e){
		var name = $("input[type='file']").val();
		var ext = name.substr(name.lastIndexOf("\.") + 1);
		if(ext != "jpg" && ext != "JPG" && ext != "png" && ext != "PNG" && ext != "tff" && ext != "TIFF" && ext != "jpeg" && ext != "JPEG" && ext != "pdf" && ext != "PDF"){
			swal("", "فرمت فایل پذیرفتنی نیست.", "error");
			$(this).val("");
		}
		else
			swal("", "فایل اتخاب شد!", "success");
	});
});