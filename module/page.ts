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

// 页面任务接口
interface PageTask{
    url: string;
    widthType?: string;
    width?: number;
    heightType?: string;
    height?: number;
}

global.imgPool = new PromisePool.Pool(function (imgTask: ImageTask, index: number) {

    return picture.runImgTask(imgTask, 5)
            .then(function(){
                var image = new Image({
                    title: imgTask.title,
                    name: imgTask.name,
                    source: imgTask.source
                });
                image.save(function(err) {
                    if(err){
                        console.log(err);
                    }
                });
                //console.log(imgTask.name + ': 获取成功！');
            })
            .catch(function(err){
                //console.log(imgTask.name + ': 获取失败！');
            });
    
}, 20, true);

global.imgPool.retries = 5;

class Page {
    getPage(pageTask: PageTask) {
    
        return new Promise(function (resolve, reject) {
            
            request({  
                url: pageTask.url,
                headers: {
                    'User-Agent': 'request'
                }
            },function(error, response, body) {  
                
                if (!error && response.statusCode == 200) {
                    
                    let reg = /<a.+?href=('|")?([^'"]+)('|")?(?:\s+|>)/gi;
                    let imgReg = /<img [^>]*src=['"]([^'"]+)['"][^>]*alt=['"]([^'"]+)['"][^>]*>/gi;
                    let titleReg =  /<title>([^<]*)<\/title>/gi;
                    /*var encodeReg =  /<meta[^>]*charset=['"]?([^"]*)['"]?[^>]*(\/>|<\/meta>)/gim;
                    var pageEncode = encodeReg.exec(body);
                    
                    //console.log(pageEncode);
                    if(pageEncode){
                        //console.log(pageEncode[1]);
                        //console.log(pageEncode[1].toLowerCase().indexOf('gb2312'));
                        if (pageEncode[1].toLowerCase().indexOf('gb2312') != -1) { //如果网页中有乱码则对其进行转码
                            //console.log(body);
                            body = iconv.decode(body, 'gb2312');
                            //console.log(body);
                        } else if(pageEncode[1].toLowerCase().indexOf('gbk') != -1) {
                            //console.log(body);
                            body = iconv.decode(body, 'gbk');
                            //console.log(body);
                        }    
                    }*/
                    
                    let arr: PageTask[] = [];
                    let tem: string[];
                    let imgTem: string[];
                    let imgArr: ImageTask[] = [];
                    let pageTitle: string[] = titleReg.exec(body);
                    
                    let urlObj: Url.Url = Url.parse(pageTask.url);
                    
                    let imgUrl: string = '';
                    
                    while (imgTem = imgReg.exec(body)) {
                        //如果图片名为空或者后缀不是图片则放弃该图片
                        if (imgTem[1].substr(imgTem[1].lastIndexOf('/') + 1) && ['.jpg', '.gif', 'png'].indexOf(imgTem[1].substr(imgTem[1].lastIndexOf('.'))) != -1 ) {
                            
                            if (imgTem[1].indexOf('http') == 0) { //图片路径以http开头则直接使用该图片路径
                                imgUrl = imgTem[1];
                            } else { //图片路径不是以http开头则分析访问地址并拼接出图片路径
                                imgUrl = urlObj.protocol + '//' + urlObj.host + imgTem[1];
                            }
                            imgArr.push({
                                url: imgUrl,
                                name: uuid.v1() + imgTem[1].substr(imgTem[1].lastIndexOf('.')), //生成唯一图片名
                                title: imgTem[2],
                                source: pageTitle ? pageTitle[1] : '',
                                widthType: pageTask.widthType,
                                width: pageTask.width,
                                heightType: pageTask.heightType,
                                height: pageTask.height
                            });
                            
                        }
                        
                    }
                    if (imgArr.length) { //如果有图片任务则添加到任务队列
                        global.imgPool.add(imgArr);
                    }
                    
                    let pageTaskUrl: string = '';

                    while (tem = reg.exec(body)) {
                        if (tem[2].indexOf('http') == 0) {
                            pageTaskUrl = tem[2]
                        } else {
                            pageTaskUrl = pageTask.url + tem[2];
                        }
                         
                        arr.push({
                            url: pageTaskUrl,
                            widthType: pageTask.widthType,
                            width: pageTask.width,
                            heightType: pageTask.heightType,
                            height: pageTask.height
                        });
                    }
                    
                    return resolve(arr);
                } else {
                    return reject(error);
                }
            });
        });
    };
}

export default Page;