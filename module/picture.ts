import * as bluebird from 'bluebird';
import * as fs from 'fs';
import * as request from 'request';
import {default as Helper} from './helper';

let helper = new Helper();

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

class Picture {
    downloadOneImg(task: ImageTask, seconds: number) {
        let tmp_t = task;
        return new bluebird(function (resolve, reject) {
            let ws = fs.createWriteStream('./public/images/' + tmp_t.name);
    
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

    runImgTask(task: ImageTask, seconds: number) {

        let that = this;
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
}

export default Picture;