var _ = require('underscore');
var Tkproxy = require('./module/tk-proxy');
var Page = require('./module/page');
var Img = require('./module/img');
var express = require('express');
var Image = require('./models/image');
var tk = new Tkproxy();
var page = new Page();
var img = new Img();

global.img_arr = [];//要抓取的图片

var totalPage = 10;//总抓取页数
var imgCount = 20; // 同时抓取图片数
var pageCount = 3; // 同时抓取的页数
var currImgCount = 0; // 当前正在抓取的图片数
var currPageCount = 0; // 当前正在抓取的页数
var runImgInterval = 30; // 抓取图片的任务间隔
var runPageInterval = 500; // 抓取页数的任务间隔
var flushInterval = 10000; // 保存任务列表的时间间隔
var proxyPoolSize = 20; // 保持有 n 个可以用的ip在内存里面
// 开始维护一个有效代理数至少在 n 的一个代理地址池子
tk.start(proxyPoolSize);

// 抓取图片
setInterval(function () {
    var ip = tk.getOneProxy();
    if (currImgCount < imgCount
        && ip
    ) {
        var imgTask = _.find(img_arr, function (e) {
            return e.status == 'off' && e.failedTimes < 5;
        });
        if (imgTask === undefined) {
            console.log('没有需要抓取的图片');
            return;
        }

        currImgCount++;
        imgTask.status = 'pending';
        return img.runImgTask(ip, imgTask, 50)
            .then(function () {
                var image = new Image({
                    title: imgTask.title,
                    name: imgTask.fileName
                });
                image.save(function(err) {
                    if(err){
                        console.log(err);
                    }
                });
                // 把任务删掉
                var tmpIndex = _.findIndex(img_arr, function (e) {
                    return e.fileName == imgTask.fileName;
                });
                img_arr.splice(tmpIndex, 1);
                
                
                console.log('成功完成一张图片的下载');
                
            })
            .catch(function (err) {
                console.log('一张图片下载失败');
                imgTask.status = 'off';
                imgTask.failedTimes++;
                console.log(err);
                return tk.delOneProxy(ip);

            })
            .finally(function () {
                currImgCount--;
            });
    }
}, runImgInterval);

var currPage = 2;
// 抓取一页数据
setInterval(function () {
    if(currPage <= totalPage) {
		var ip = tk.getOneProxy();
		if (currPageCount < pageCount
			&& ip
		) {
			currPageCount++;
			return page.runTask(ip, currPage, 20)
				.then(function () {
					//完成一页
					currPage++;
                    console.log('完成一页');
				})
				.catch(function (err) {
					console.log('失败一页');
					currPage++;
				})
				.finally(function () {
					
                    currPageCount--;
				});
		}
	}else{
		console.log('页面抓取完毕！');
	}
}, runPageInterval);

var app = express();
app.get('/reptile', function (req, res) {

    var imgCounts = img.getCounts();

    var resString =
        "<pre>还需抓取图片数量：" + imgCounts['off'] + "</pre>" +
        "<pre>正在抓取图片数量：" + imgCounts['pending'] + "</pre>" +
        "<pre>抓取失败图片数量：" + img.getHaveFailedCount()['failed'] + "</pre>";


    res.send(resString);

});

app.listen(3000);