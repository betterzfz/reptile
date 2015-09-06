$(function(){
        
	//分页功能
	var page = $('#page1');
	var options = {
		currentPage:page.attr('pageNum'),
		totalPages:page.attr('pageCount'),
		numberOfPages:page.attr('numberOfPages'),
		pageUrl:function(type, page, current){
			return "/?p="+page;
		}
	}
	$('#page1').bootstrapPaginator(options);
	
	$('.row img').mouseover(function(){
		$(this).css('opacity',1);
		$(this).next().css('display','block');
	}).mouseout(function(){
		$(this).css('opacity',0.5);
		$(this).next().css('display','none');
	});

})