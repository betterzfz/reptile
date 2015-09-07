$(function(){
	$('#type').change(function(){
		var type_val = $(this).val();
		if(type_val == 0){
			$('#num').css('display','none');
		} else {
			$('#num').css('display','block');
		}
	});
	
	$('select[name="colorpicker"]').simplecolorpicker();	
})