import * as request from 'request';
import * as promisePool from 'promise-pool';
import * as nodeUrl from 'url';
import * as uuid from 'node-uuid';
import {default as Image} from '../models/image';
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
                /*var encodeReg =  /<meta[^>]*charset=['"]?([^"]*)['"]?[^>]*(\/>|<\/meta>)/gim;
                var pageEncode = encodeReg.exec(body);
                
                //console.log(pageEncode);
                if(pageEncode){
                    //console.log(pageEncode[1]);
                    //console.log(pageEncode[1].toLowerCase().indexOf('gb2312'));
                    if (pageEncode[1].toLowerCase().indexOf('gb2312') != -1) { //如果网页中有乱码则对其进行转码
                        //console.log(body);
                        body = iconv.decode(body, 'gb2312');
                        //console.log(body);
                    } else if(pageEncode[1].toLowerCase().indexOf('gbk') != -1) {
                        //console.log(body);
                        body = iconv.decode(body, 'gbk');
                        //console.log(body);
                    }    
                }*/
                
                var arr = [];
                var tem;
                var imgTem;
                var imgArr = [];
                var pageTitle = titleReg.exec(body);
                
                var urlObj = nodeUrl.parse(url);
                
                while (imgTem = imgReg.exec(body)) {
                    //如果图片名为空或者后缀不是图片则放弃该图片
                    if (imgTem[1].substr(imgTem[1].lastIndexOf('/') + 1) && ['.jpg', '.gif', 'png'].indexOf(imgTem[1].substr(imgTem[1].lastIndexOf('.'))) != -1 ) {
                        
                    
                        if (imgTem[1].indexOf('http') == 0) { //图片路径以http开头则直接使用该图片路径
                            imgArr.push({
                                url: imgTem[1],
                                name: uuid.v1() + imgTem[1].substr(imgTem[1].lastIndexOf('.')), //生成唯一图片名
                                title: imgTem[2],
                                source: pageTitle ? pageTitle[1] : ''
                            });
                        } else { //图片路径不是以http开头则分析访问地址并拼接出图片路径
                            imgArr.push({
                                url: urlObj.protocol + '//' + urlObj.host + imgTem[1],
                                name: uuid.v1() + imgTem[1].substr(imgTem[1].lastIndexOf('.')), //生成唯一图片名
                                title: imgTem[2],
                                source: pageTitle ? pageTitle[1] : ''
                            });
                        }
                    }
                    
                }
                if (imgArr.length) { //如果有图片任务则添加到任务队列
                    imgPool.add(imgArr);
                    /*imgPool.start(onImgProgress).then(function(result) {
                        console.log('完成 ' + result.total + ' 个图片任务.');
                    });*/
                }
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

