var request = require('request');
var PromisePool = require('promise-pool');
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
var Category = (function () {
    function Category() {
    }
    Category.prototype.getCategoty = function (categoryTask) {
        return new Promise(function (resolve, reject) {
            request({
                url: 'http://image.baidu.com/i?tn=baiduimagejson&ct=201326592&cl=2&lm=-1&st=-1&fm=result&fr=&sf=1&fmq=1349413075627_R&pv=&ic=0&nc=1&z=&se=1&showtab=0&fb=0&width=&height=&face=0&istype=2&word=' + encodeURIComponent(categoryTask.info) + '&rn=' + categoryTask.num + '&pn=' + categoryTask.page,
                headers: {
                    'User-Agent': 'request'
                }
            }, function (error, response, body) {
                var imgArr = [];
                var bodyData = JSON.parse(body);
                if (!error && response.statusCode == 200) {
                    for (var i = 0; i < bodyData.data.length - 1; i++) {
                        if (bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')).toLowerCase() == '.jpg' || bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')).toLowerCase() == '.png' || bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')).toLowerCase() == '.gif') {
                            imgArr.push({
                                url: bodyData.data[i].objURL,
                                name: uuid.v1() + bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')),
                                title: bodyData.data[i].fromPageTitleEnc,
                                source: '百度',
                                widthType: categoryTask.widthType,
                                width: categoryTask.width,
                                heightType: categoryTask.heightType,
                                height: categoryTask.height
                            });
                        }
                    }
                    console.log(imgArr);
                    if (imgArr.length) {
                        global.imgPool.add(imgArr);
                    }
                    return resolve(body);
                }
                else {
                    return reject(error);
                }
            });
        });
    };
    ;
    return Category;
})();
exports["default"] = Category;
