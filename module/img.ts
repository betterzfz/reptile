import * as bluebird from 'bluebird';
import * as fs from 'fs';
import * as request from 'request';
var Helper = require('../module/helper');
var helper = new Helper();

var Img = function () {

};


Img.prototype.downloadOneImg = function (task, seconds) {
    
    var tmp_t = task;
    return new bluebird.Promise(function (resolve, reject) {
        var ws = fs.createWriteStream('./public/images/' + tmp_t.name);

        request
            .get({
                url: task.url,
                timeout: seconds * 1000
            })
            .on('error', function (err) {
                return reject(err);
            })
            .pipe(ws)
            .on('close', function(){
                return resolve('./public/images/' + tmp_t.name);
            })
    });
};

Img.prototype.runImgTask = function (task, seconds) {

    var that = this;
    // 判断一个文件是不是已经存在，如果已经存在就抛错

    return helper
        .isExist('./public/images/' + task.name)
        .then(function (isExists) {
            // 文件不存在 开始下载
            return that.downloadOneImg(task, seconds);
        })
        .then(function (path) {
            //console.log('一张图片下载成功');
            
            return helper.isValidImg(path);
        });
};

module.exports = Img;
