/// <reference path="../typings/tsd.d.ts" />

import * as fs from 'fs';
import * as bluebird from 'bluebird';
import * as readChunk from 'read-chunk'; 
import * as fileType from 'file-type';
import * as sizeOf from 'image-size';

// 图片任务接口
interface ImageTask{
    url: string;
    name: string; 
    title: string;
    source: string;
    widthType: string;
    width: number;
    heightType: string;
    height: number;
}

class Helper {
    isExist(file: string) {
        return new bluebird(function (resolve, reject) {
            fs.exists(file, function (exists) {
                if (exists) return resolve(true);
                else return resolve(false);
            });
        })
    };
    
    isValidImg(file: any, task: ImageTask) {
        let that = this;
        let tmp_filename: string = file;
        return that
            .isExist(tmp_filename)
            .then(function (isExistResult: boolean) {
                if (isExistResult) {
                    let buffer = readChunk.sync(file, 0, 262);
                    let result = fileType(buffer);
    
    
                    return result && (result.ext == 'jpg' || result.ext == 'png' || result.ext == 'gif');
                    
                }
                console.log('文件不存在');
            })
            .then(function (isValidImgResult: boolean) {
                if (isValidImgResult) {
                    return that.isValidSize(tmp_filename, task);
                }
                console.log('文件不是一个合法的图片文件');
            });
    };
    
    isValidSize(file: string, task: ImageTask) {
        let that = this;
    
        return new bluebird(function (resolve, reject) {
            
            sizeOf(file, function (err, dimensions) { //过滤图片大小
                if (err) console.log(err);
                
                let imgArrFlag: number = 0; // 图片是否满足大小需求
                
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
                } else {
                    fs.unlinkSync(file);
                    return reject('图片尺寸不合法');
                }
                
            });
            
            
        })
    };
}

export default Helper;