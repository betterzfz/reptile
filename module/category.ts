import * as request from 'request';
import * as PromisePool from 'promise-pool';
import * as Url from 'url';
import * as uuid from 'node-uuid';
import Image from '../models/image';
import Picture from './picture';

let picture = new Picture();

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

//分类任务接口
interface CategoryTask{
    info: string,
    num: number,
    page: number,
    widthType?: string;
    width?: number;
    heightType?: string;
    height?: number;
}

global.imgPool = new PromisePool.Pool(function(imgTask: ImageTask, index: number) {

    return picture.runImgTask(imgTask, 5)
        .then(function() {
            var image = new Image({
                title: imgTask.title,
                name: imgTask.name,
                source: imgTask.source,
                origin: imgTask.url
            });
            image.save(function(err) {
                if (err) {
                    console.log(err);
                }
            });
            //console.log(imgTask.name + ': 获取成功！');
        })
        .catch(function(err) {
            //console.log(imgTask.name + ': 获取失败！');
        });

}, 20, true);

global.imgPool.retries = 5;

class Category {
    getCategoty(categoryTask: CategoryTask) {

        return new Promise(function(resolve, reject) {
    
            request({
                url: 'http://image.baidu.com/i?tn=baiduimagejson&ct=201326592&cl=2&lm=-1&st=-1&fm=result&fr=&sf=1&fmq=1349413075627_R&pv=&ic=0&nc=1&z=&se=1&showtab=0&fb=0&width=&height=&face=0&istype=2&word=' + encodeURIComponent(categoryTask.info) + '&rn=' + categoryTask.num + '&pn=' + categoryTask.page,
                headers: {
                    'User-Agent': 'request'
                }
            }, function(error, response, body) {
    
                let imgArr: ImageTask[] = [];
                let bodyData = JSON.parse(body);
    
                if (!error && response.statusCode == 200) {
    
                    for (let i = 0; i < bodyData.data.length - 1; i++) {
                        if (bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')).toLowerCase() == '.jpg' || bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')).toLowerCase() == '.png' || bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')).toLowerCase() == '.gif') {
                            imgArr.push({
                                url: bodyData.data[i].objURL,
                                name: uuid.v1() + bodyData.data[i].objURL.substr(bodyData.data[i].objURL.lastIndexOf('.')), //生成唯一图片名
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
                    if (imgArr.length) { //如果有图片任务则添加到任务队列
                        global.imgPool.add(imgArr);
    
                    }
                    return resolve(body);
                } else {
                    return reject(error);
                }
            });
        });
    };
}

export default Category;