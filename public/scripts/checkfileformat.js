$(document).ready(function(){
	if($("input[type='file']").length){
		$("button[type='submit']").click(function(event) {
			event.preventDefault();
			if($("input[type='file']").val())
				$(this).parent("form").submit();
			else
				swal({text: "ابتدا فایل پاسخ را انتخاب کنید.", type: "error", customClass: "rtl"});
		});
	} else{
		$("button[type='submit']").click(function(event) {
			event.preventDefault();
			if($("input[type='text']").val())
				$(this).parent("form").submit();
			else
				swal({text: "ابتدا پاسخ را وارد کنید.", type: "error", customClass: "rtl"});
		});
	}
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