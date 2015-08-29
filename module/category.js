var request = require('request');
var promisePool = require('promise-pool');
var nodeUrl = require('url');
var uuid = require('node-uuid');
var iconv = require('iconv-lite');
var Image = require('../models/image');
var Img = require('./img');
var img = new Img();

global.imgPool = new promisePool.Pool(function (imgTask, index) {

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
                //console.log(imgTask.name + ': 获取成功！');
            })
            .catch(function(err){
                //console.log(imgTask.name + ': 获取失败！');
            });
    
}, 20, true);

function onImgProgress(progress) {
    if (progress.success) {
        //console.log(progress.fulfilled + '/' + progress.total);
    } else {
        //console.log('图片任务 ' + progress.index + ' 因为 ' + (progress.error ? progress.error.message : '没有错误') + ' 而失败, 还可以进行 ' + progress.retries + '次');
    }
}

imgPool.retries = 5;
var Category = function () {
};

Category.prototype.getCategoty = function (info, num) {
    
    return new Promise(function (resolve, reject) {
        
        request({  
            url: 'http://image.baidu.com/i?tn=baiduimagejson&ct=201326592&cl=2&lm=-1&st=-1&fm=result&fr=&sf=1&fmq=1349413075627_R&pv=&ic=0&nc=1&z=&se=1&showtab=0&fb=0&width=&height=&face=0&istype=2&word=' + encodeURIComponent(info) + '&rn=' + num + '&pn=1',
            headers: {
                'User-Agent': 'request'
            }
        },function(error, response, body) {  
            
            var imgArr = [];
            var bodyData = JSON.parse(response.body);
            
            if (!error && response.statusCode == 200) {
                
                for (var i = 0;i < bodyData.data.length - 1;i++) {
                    if (bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')).toLowerCase() == '.jpg' || bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')).toLowerCase() == '.png' || bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')).toLowerCase() == '.gif') {
                        imgArr.push({
                            url: bodyData.data[i].objURL,
                            name: uuid.v1() + bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')), //生成唯一图片名
                            title: bodyData.data[i].fromPageTitleEnc,
                            source: '百度'
                        });
                    }
                    
                }
                console.log(imgArr);
                if (imgArr.length) { //如果有图片任务则添加到任务队列
                    imgPool.add(imgArr);
                    
                }
                return resolve(body);
            } else {
                return reject(error);
            }
        });
    });
};

module.exports = Category;

