var request = require('request');
var PromisePool = require('promise-pool');
var Url = require('url');
var uuid = require('node-uuid');
var image_1 = require('../models/image');
var picture_1 = require('./picture');
var picture = new picture_1["default"]();
global.imgPool = new PromisePool.Pool(function (imgTask, index) {
    return picture.runImgTask(imgTask, 5)
        .then(function () {
        var image = new image_1["default"]({
            title: imgTask.title,
            name: imgTask.name,
            source: imgTask.source
        });
        image.save(function (err) {
            if (err) {
                console.log(err);
            }
        });
        //console.log(imgTask.name + ': 获取成功！');
    })
        .catch(function (err) {
        //console.log(imgTask.name + ': 获取失败！');
    });
}, 20, true);
global.imgPool.retries = 5;
var Page = (function () {
    function Page() {
    }
    Page.prototype.getPage = function (pageTask) {
        return new Promise(function (resolve, reject) {
            request({
                url: pageTask.url,
                headers: {
                    'User-Agent': 'request'
                }
            }, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var reg = /<a.+?href=('|")?([^'"]+)('|")?(?:\s+|>)/gi;
                    var imgReg = /<img [^>]*src=['"]([^'"]+)['"][^>]*alt=['"]([^'"]+)['"][^>]*>/gi;
                    var titleReg = /<title>([^<]*)<\/title>/gi;
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
                    var urlObj = Url.parse(pageTask.url);
                    var imgUrl = '';
                    while (imgTem = imgReg.exec(body)) {
                        //如果图片名为空或者后缀不是图片则放弃该图片
                        if (imgTem[1].substr(imgTem[1].lastIndexOf('/') + 1) && ['.jpg', '.gif', 'png'].indexOf(imgTem[1].substr(imgTem[1].lastIndexOf('.'))) != -1) {
                            if (imgTem[1].indexOf('http') == 0) {
                                imgUrl = imgTem[1];
                            }
                            else {
                                imgUrl = urlObj.protocol + '//' + urlObj.host + imgTem[1];
                            }
                            imgArr.push({
                                url: imgUrl,
                                name: uuid.v1() + imgTem[1].substr(imgTem[1].lastIndexOf('.')),
                                title: imgTem[2],
                                source: pageTitle ? pageTitle[1] : '',
                                widthType: pageTask.widthType,
                                width: pageTask.width,
                                heightType: pageTask.heightType,
                                height: pageTask.height
                            });
                        }
                    }
                    if (imgArr.length) {
                        global.imgPool.add(imgArr);
                    }
                    var pageTaskUrl = '';
                    while (tem = reg.exec(body)) {
                        if (tem[2].indexOf('http') == 0) {
                            pageTaskUrl = tem[2];
                        }
                        else {
                            pageTaskUrl = pageTask.url + tem[2];
                        }
                        arr.push({
                            url: pageTaskUrl,
                            widthType: pageTask.widthType,
                            width: pageTask.width,
                            heightType: pageTask.heightType,
                            height: pageTask.height
                        });
                    }
                    return resolve(arr);
                }
                else {
                    return reject(error);
                }
            });
        });
    };
    ;
    return Page;
})();
exports["default"] = Page;
