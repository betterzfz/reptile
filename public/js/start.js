$('#type').change(function(){
	var type_val = $(this).val();
	if(type_val == 0){
		$('#way').css('display','block');
	} else {
		$('#way').css('display','none');
	}
});