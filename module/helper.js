var fs = require('fs');

var bluebird = require('bluebird');
var readChunk = require('read-chunk'); 
var fileType = require('file-type');
var sizeOf = require('image-size');

var Helper = function () {
};

Helper.prototype.isExist = function (file) {
    
    return new bluebird.Promise(function (resolve, reject) {
        fs.exists(file, function (exists) {
            if (exists) return resolve(true);
            else return resolve(false);
        });
    })
};

Helper.prototype.isImgBlank = function (file) {

    return new bluebird.Promise(function (resolve, reject) {
        sizeOf(file, function (err, dimensions) {

            if (err) return reject(err);

            if (dimensions.width > 2 && dimensions.height) {
                return resolve(false);
            }
            else {
                return reject('图片小于 2 x 2');
            }
        });
    })
};

Helper.prototype.isValidImg = function (file) {
    var that = this;
    var tmp_filename = file;
    return that
        .isExist(tmp_filename)
        .then(function (isExistResult) {
            if (isExistResult) {
                var buffer = readChunk.sync(file, 0, 262);
                var result = fileType(buffer);


                return result && (result.ext == 'jpg' || result.ext == 'png' || result.ext == 'gif');
                
            }
            throw new Error('文件不存在');
        })
        .then(function (isValidImgResult) {
            if (isValidImgResult) {
                return that.isImgBlank(tmp_filename);
            }
            throw new Error('文件不是一个合法的图片文件');
        });
};

module.exports = Helper;