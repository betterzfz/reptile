$(function(){
        
	//分页功能
	var page = $('#page1');
	var options = {
		currentPage:page.attr('pageNum'),
		totalPages:page.attr('pageCount'),
		numberOfPages:page.attr('numberOfPages'),
		pageUrl:function(type, page, current) {
			return "/list?p="+page;
		}
	}
	$('#page1').bootstrapPaginator(options);

	//打包图片
	$('#archive').click(function() {
		var images = [];
		$('input[name="images"]:checked').each(function() {
			alert($(this).attr('data'));
			images.push($(this).attr('data'));
		});
		
		if (images.length == 0) {
			alert('请选择要打包的图片！');
		} else {
			alert(images);
		}
	});
})