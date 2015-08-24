var bluebird = require('bluebird');
var fs = require('fs');

var $ = require('cheerio');
var _ = require('underscore');
var request = require('request');


var Helper = require('../module/helper');
var helper = new Helper();

var Img = function () {

};


Img.prototype.downloadOneImg = function (ip, task, seconds) {
    //var that = this;
    var tmp_t = task;
    return new bluebird.Promise(function (resolve, reject) {
        var ws = fs.createWriteStream('./public/images/' + tmp_t.fileName);

        request
            .get({
                url: 'http://photostock.china.com.cn' + task.src,
                timeout: seconds * 1000
                //proxy: 'http://' + ip
            })
            .on('error', function (err) {
                return reject(err);
            })
            .pipe(ws)
            .on('close', function(){
                return resolve('./public/images/' + tmp_t.fileName);
            })
    });
};

Img.prototype.runImgTask = function (ip, task, seconds) {

    var that = this;
    // 判断一个文件是不是已经存在，如果已经存在就抛错

    return helper
        .isExist('./public/images/' + task.fileName)
        .then(function (isExists) {
            // 文件不存在 开始下载
            return that.downloadOneImg(ip, task, seconds);
        })
        .then(function (path) {
            console.log('一张图片下载成功');
            
            return helper.isValidImg(path);
        });
};

Img.prototype.getCounts = function () {
    return _.countBy(img_arr, function (e) {
        if (e.status == 'done') return 'done';
        if (e.status == 'pending') return 'pending';
        return 'off';
    });
};

Img.prototype.getHaveFailedCount = function () {
    return _.countBy(img_arr, function (e) {
        if (e.failedTimes == 1) return 'failed1';
        if (e.failedTimes == 2) return 'failed2';
        if (e.failedTimes == 3) return 'failed3';
        if (e.failedTimes == 4) return 'failed4';
        if (e.failedTimes == 5) return 'failed5';
        if (e.failedTimes == 6) return 'failed6';
        if (e.failedTimes == 7) return 'failed7';
        if (e.failedTimes == 8) return 'failed8';
        if (e.failedTimes == 9) return 'failed9';
        if (e.failedTimes == 10) return 'failed10';
        else return 'off';
    })
};


module.exports = Img;
