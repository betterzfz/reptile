/// <reference path="../typings/tsd.d.ts" />

import * as fs from 'fs';
import * as bluebird from 'bluebird';
import * as readChunk from 'read-chunk'; 
import * as fileType from 'file-type';
import * as sizeOf from 'image-size';
import * as thmclrx from 'thmclrx';
import Image from '../models/image';

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
    color: string;
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
    
    isDataExist(imageTask: ImageTask) {
        return new bluebird(function (resolve, reject) {
            Image.count({origin: imageTask.url}, function(err: any, count: number){
                if (err) {
                    console.log(err);
                } else {
                    if (count == 0) {
                        return resolve(false);
                    } else {
                        return resolve(true);
                    }
                }
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
                //console.log('文件不存在');
            })
            .then(function (isValidImgResult: boolean) {
                if (isValidImgResult) {
                    return that.isValidSize(tmp_filename, task);
                }
                //console.log('文件不是一个合法的图片文件');
            });
            /*.then(function () {
                return that.isValidColor(tmp_filename, task);
                
            });*/
    };
    
    isValidSize(file: string, task: ImageTask) {
        let that = this;
    
        return new bluebird(function (resolve, reject) {
            
            sizeOf(file, function (err, dimensions) { //过滤图片大小
                if (err) console.log(err);
                
                let imgArrFlag = 0; // 图片是否满足大小需求
                
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
    
    isValidColor(file: string, task: ImageTask) {
        let that = this;
    
        return new bluebird(function (resolve, reject) {
            
            /*if (task.color != '0') {
                
                        let taskColorR: number = parseInt(task.color.substr(1,2), 16);
                        let taskColorG: number = parseInt(task.color.substr(3,2), 16);
                        let taskColorB: number = parseInt(task.color.substr(5,2), 16);
                        thmclrx.cleanPool();
                        thmclrx.octreeGet(file, 6, function(err, result) {
                            console.log('thm')
                            if(err) {
                                console.log(err.message);
                                return false;
                            }
                            
                            let colorFlag: number = 0;
                            
                            let tagcolor: string = result[0].color.toLowerCase();
                            let colorR: number = parseInt(tagcolor.substr(0,2), 16);
                            let colorG: number = parseInt(tagcolor.substr(2,2), 16);
                            let colorB: number = parseInt(tagcolor.substr(4,2), 16);
                            let diffValue: number = Math.abs(colorR - taskColorR) + Math.abs(colorG - taskColorG) + Math.abs(colorB - taskColorB);
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
                                return true;
                            } else {
                                fs.unlinkSync(file);
                                return false;
                            }
                            
                            
                            
                        })
                        console.log('ok');
                    } else {
                        return true;
                    }*/
            
            
        })
    };
}

export default Helper;