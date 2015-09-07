var bluebird = require('bluebird');
var fs = require('fs');
var request = require('request');
var helper_1 = require('./helper');
var helper = new helper_1.default();
var Picture = (function () {
    function Picture() {
    }
    Picture.prototype.downloadOneImg = function (task, seconds) {
        var tmp_t = task;
        return new bluebird(function (resolve, reject) {
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
                .on('close', function () {
                return resolve('./public/images/' + tmp_t.name);
            });
        });
    };
    ;
    Picture.prototype.runImgTask = function (task, seconds) {
        var that = this;
        // 判断一个文件是不是已经存在，如果已经存在就抛错
        return helper
            .isDataExist(task)
            .then(function (isExists) {
            // 文件不存在 开始下载
            return that.downloadOneImg(task, seconds);
        })
            .then(function (path) {
            //console.log('一张图片下载成功');
            return helper.isValidImg(path, task);
        });
    };
    ;
    return Picture;
})();
exports["default"] = Picture;
