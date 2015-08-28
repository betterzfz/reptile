var bluebird = require('bluebird');
var request = require('request');
var promisePool = require('promise-pool');
var nodeUrl = require('url');
var Image = require('../models/image');
var Img = require('./img');
var img = new Img();

var imgPool = new promisePool.Pool(function (imgTask, index) {

    return img.runImgTask(imgTask, 5)
            .then(function(){
                var image = new Image({
                    title: imgTask.title,
                    name: imgTask.name,
                    source: imgTask.source
                });
                image.save(function(err) {
                    if(err){
                        console.log(err);
                    }
                });
                console.log(imgTask.name + ': 获取成功！');
            })
            .catch(function(err){
                console.log(imgTask.name + ': 获取失败！');
            });
    
}, 20);

function onImgProgress(progress) {
    if (progress.success) {
        console.log(progress.fulfilled + '/' + progress.total);
    } else {
        console.log('图片任务 ' + progress.index + ' 因为 ' + (progress.error ? progress.error.message : '没有错误') + ' 而失败, 还可以进行 ' + progress.retries + '次');
    }
}

imgPool.retries = 5;
var Page = function () {
};

Page.prototype.getPage = function (url) {
    
    return new Promise(function (resolve, reject) {
        
        request({  
            url: url,
            headers: {
                'User-Agent': 'request'
            }
        },function(error, response, body) {  
            if (!error && response.statusCode == 200) {
                var reg = /<a.+?href=('|")?([^'"]+)('|")?(?:\s+|>)/gim;
                var imgReg = /<img [^>]*src=['"]([^'"]+)['"][^>]*alt=['"]([^'"]+)['"][^>]*>/gim;
                var titleReg =  /<title>([^<]*)<\/title>/gim;
                var arr = [];
                var tem;
                var imgTem;
                var imgArr = [];
                var pageTitle = titleReg.exec(body);
                var urlObj = nodeUrl.parse(url);
                while (imgTem = imgReg.exec(body)) {
                    if (imgTem[1].indexOf('http') == 0) {
                        imgArr.push({
                            url: imgTem[1],
                            name: imgTem[1].substr(imgTem[1].lastIndexOf('/') + 1),
                            title: imgTem[2],
                            source: pageTitle[1]
                        });
                    } else {
                        imgArr.push({
                            url: urlObj.protocol + '//' + urlObj.host + imgTem[1],
                            name: imgTem[1].substr(imgTem[1].lastIndexOf('/') + 1),
                            title: imgTem[2],
                            source: pageTitle[1]
                        });
                    }
                    
                }
                
                imgPool.add(imgArr);
                
                imgPool.start(onImgProgress).then(function(result) {
                    console.log('完成 ' + result.total + ' 个图片任务.');
                });
        
                while (tem = reg.exec(body)) {
                    if (tem[2].indexOf('http') == 0) {
                        arr.push(tem[2]);
                    } else {
                        arr.push(url + tem[2]);
                    }
                }
                
                return resolve(arr);
            } else {
                return reject(error);
            }
        });
    });
};

module.exports = Page;

