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
			images.push($(this).attr('data'));
		});
		
		if (images.length == 0) {
			alert('请选择要打包的图片！');
		} else {
			$('#form').submit();
		}
	});
	
	$('#select-all').click(function() {
		$('input[name="images"]').prop('checked', this.checked);
	});
	
	var $images = $('input[name="images"]');
	$images.click(function(){
		if ($images.length == $('input[name="images"]:checked').length) {
			$('#select-all').prop('checked', true);	
		} else {
			$('#select-all').prop('checked', false);
		}
	});
	
	$('#un-paging').click(function(){
		window.location.href = './list?paging=' + this.checked;
	});
	
	$('.delete-image').click(function(){
		if (confirm('你确定删除这条记录吗？')) {
			window.location.href = './delete?name=' + $(this).attr('data');
		}
	});
	
	$('#drop').click(function(){
		if (confirm('你确定清空所有记录吗？')) {
			window.location.href = './drop';
		}
	});
})