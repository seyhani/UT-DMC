$(document).ready(function(){
	$("input[type='file']").change(function(e){
		var name = $("input[type='file']").val();
		var ext = name.substr(name.lastIndexOf("\.") + 1);
		if(ext != "jpg" && ext != "JPG" && ext != "png" && ext != "PNG" && ext != "tff" && ext != "TIFF" && ext != "jpeg" && ext != "JPEG" && ext != "pdf" && ext != "PDF"){
			swal({text: "فرمت فایل پذیرفتنی نیست.", type: "error", customClass: "rtl"});
			$(this).val("");
		}
		else
			swal({text: "فایل اتخاب شد!", type: "success", customClass: "rtl"});
	});
});