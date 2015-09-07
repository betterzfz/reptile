/// <reference path="../typings/tsd.d.ts" />
var fs = require('fs');
var bluebird = require('bluebird');
var readChunk = require('read-chunk');
var fileType = require('file-type');
var sizeOf = require('image-size');
var thmclrx = require('thmclrx');
var image_1 = require('../models/image');
var Helper = (function () {
    function Helper() {
    }
    Helper.prototype.isExist = function (file) {
        return new bluebird(function (resolve, reject) {
            fs.exists(file, function (exists) {
                if (exists)
                    return resolve(true);
                else
                    return resolve(false);
            });
        });
    };
    ;
    Helper.prototype.isDataExist = function (imageTask) {
        return new bluebird(function (resolve, reject) {
            image_1["default"].count({ origin: imageTask.url }, function (err, count) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (count == 0) {
                        return resolve(false);
                    }
                    else {
                        return resolve(true);
                    }
                }
            });
        });
    };
    ;
    Helper.prototype.isValidImg = function (file, task) {
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
            //console.log('文件不存在');
        })
            .then(function (isValidImgResult) {
            if (isValidImgResult) {
                return that.isValidSize(tmp_filename, task);
            }
            //console.log('文件不是一个合法的图片文件');
        });
        /*.then(function () {
            return that.isValidColor(tmp_filename, task);
            
        });*/
    };
    ;
    Helper.prototype.isValidSize = function (file, task) {
        var that = this;
        return new bluebird(function (resolve, reject) {
            sizeOf(file, function (err, dimensions) {
                if (err)
                    console.log(err);
                var imgArrFlag = 0; // 图片是否满足大小需求
                switch (task.widthType) {
                    case '>=':
                        switch (task.heightType) {
                            case '>=':
                                if (dimensions.width >= task.width && dimensions.height >= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '>':
                                if (dimensions.width >= task.width && dimensions.height > task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '==':
                                if (dimensions.width >= task.width && dimensions.height == task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<=':
                                if (dimensions.width >= task.width && dimensions.height <= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<':
                                if (dimensions.width >= task.width && dimensions.height < task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                        }
                        break;
                    case '>':
                        switch (task.heightType) {
                            case '>=':
                                if (dimensions.width > task.width && dimensions.height >= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '>':
                                if (dimensions.width > task.width && dimensions.height > task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '==':
                                if (dimensions.width > task.width && dimensions.height == task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<=':
                                if (dimensions.width > task.width && dimensions.height <= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<':
                                if (dimensions.width > task.width && dimensions.height < task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                        }
                        break;
                    case '==':
                        switch (task.heightType) {
                            case '>=':
                                if (dimensions.width == task.width && dimensions.height >= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '>':
                                if (dimensions.width == task.width && dimensions.height > task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '==':
                                if (dimensions.width == task.width && dimensions.height == task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<=':
                                if (dimensions.width == task.width && dimensions.height <= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<':
                                if (dimensions.width == task.width && dimensions.height < task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                        }
                        break;
                    case '<=':
                        switch (task.heightType) {
                            case '>=':
                                if (dimensions.width <= task.width && dimensions.height >= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '>':
                                if (dimensions.width <= task.width && dimensions.height > task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '==':
                                if (dimensions.width <= task.width && dimensions.height == task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<=':
                                if (dimensions.width <= task.width && dimensions.height <= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<':
                                if (dimensions.width <= task.width && dimensions.height < task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                        }
                        break;
                    case '<':
                        switch (task.heightType) {
                            case '>=':
                                if (dimensions.width < task.width && dimensions.height >= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '>':
                                if (dimensions.width < task.width && dimensions.height > task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '==':
                                if (dimensions.width < task.width && dimensions.height == task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<=':
                                if (dimensions.width < task.width && dimensions.height <= task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                            case '<':
                                if (dimensions.width < task.width && dimensions.height < task.height) {
                                    imgArrFlag = 1;
                                }
                                break;
                        }
                        break;
                }
                if (imgArrFlag == 1) {
                    return resolve(false);
                }
                else {
                    fs.unlinkSync(file);
                    return reject('图片尺寸不合法');
                }
            });
        });
    };
    ;
    Helper.prototype.isValidColor = function (file, task) {
        var that = this;
        return new bluebird(function (resolve, reject) {
            if (task.color != '0') {
                var taskColorR = parseInt(task.color.substr(1, 2), 16);
                var taskColorG = parseInt(task.color.substr(3, 2), 16);
                var taskColorB = parseInt(task.color.substr(5, 2), 16);
                thmclrx.octreeGet(file, 6, function (err, result) {
                    console.log('thm');
                    if (err) {
                        return resolve(err.message);
                    }
                    var colorFlag = 0;
                    var tagcolor = result[0].color.toLowerCase();
                    var colorR = parseInt(tagcolor.substr(0, 2), 16);
                    var colorG = parseInt(tagcolor.substr(2, 2), 16);
                    var colorB = parseInt(tagcolor.substr(4, 2), 16);
                    var diffValue = Math.abs(colorR - taskColorR) + Math.abs(colorG - taskColorG) + Math.abs(colorB - taskColorB);
                    console.log(tagcolor);
                    console.log(colorR);
                    console.log(colorG);
                    console.log(colorB);
                    console.log(diffValue);
                    if (diffValue < 800) {
                        colorFlag = 1;
                    }
                    console.log(colorFlag);
                    if (colorFlag == 1) {
                        return resolve(true);
                    }
                    else {
                        fs.unlinkSync(file);
                        return reject('图片色调不搭配');
                    }
                });
                console.log('ok');
            }
            else {
                return resolve(true);
            }
        });
    };
    ;
    return Helper;
})();
exports["default"] = Helper;
