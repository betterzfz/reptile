import * as express from 'express';
import * as swig from 'swig';
import * as socket from 'socket.io';
import * as promisePool from 'promise-pool';
import {default as Image} from './models/image';
import Page from './module/page';
import Category from './module/category';

let app = express();
let server = require('http').Server(app);

app.engine('html',swig.renderFile);
app.set('view engine','html');
app.set('views',__dirname+'/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });
app.use(express.static('public'));

// 分页参数接口
interface Paging{
    limit: number;
    num: number;
    pageCount?: number;
    size?: number;
    numberOf?: number;
}

// 页面任务接口
interface PageTask{
    url: string;
    widthType?: string;
    width?: number;
    heightType?: string;
    height?: number;
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

app.get('/', function (req: express.Request, res: express.Response) {
    
    // 分页参数
    let page: Paging = {
        limit:20,
        num:1
    };

    if(req.query.p){
        page.num = req.query.p < 1 ? 1 : req.query.p;
    }
    
    let query = Image.find({});
    query.sort('_id');
    query.limit(page.limit);
    query.skip(page.num * page.limit - page.limit);
    query.exec(function (err: any,results: Document[]) {
        Image.count({},function (error: any, count: number) {
            if (error) {
                console.log(error);
            } else {
                let pageCount = Math.ceil(count / page.limit);
                page.pageCount = pageCount;
                page.size = results.length;
                page.numberOf = pageCount > 5 ? 5 : pageCount;
                res.render('index', { images : results, page : page, name : 'index', title : '展示页' });    
            }
        });
    });
    
});

app.get('/start', function (req: express.Request, res: express.Response) {
    res.render('start', { name : 'start', title : '设置页' });
});

app.get('/reptile', function (req: express.Request, res: express.Response) {
    
    
    let io: SocketIO.Server = socket(server);
    
    if(req.query.type == 0){
        
        let page: Page = new Page();
        let pool: promisePool.Pool<any> = new promisePool.Pool(function (pageTask: PageTask, index: number): any {
            return new Promise(function (resolve, reject) {
                page.getPage(pageTask)
                    .then(function(data: PageTask){
                        pool.add(data);
                        //console.log(url + ': 获取成功！');
                        return resolve('ok');
                    })
                    .catch(function(err){
                        //console.log(url + ': 获取失败！');
                        return reject('error');
                    });
            });
            
        }, 5, true);
        
        pool.retries = 5;
        let pageTask: PageTask = {
            url: req.query.info,
            widthType: req.query.widthType,
            width: req.query.width ? req.query.width : 0,
            heightType: req.query.heightType,
            height: req.query.height ? req.query.height : 0
        }
        pool.add(pageTask);
        
        io.on('connection', function (socket: SocketIO.Socket) {
            var interval = setInterval(function () {
                socket.emit('process', {
                    fulfilled: pool.fulfilled,
                    rejected: pool.rejected,
                    pending: pool.pending,
                    total: pool.total,
                    imgFulfilled: global.imgPool.fulfilled,
                    imgRejected: global.imgPool.rejected,
                    imgPending: global.imgPool.pending,
                    imgTotal: global.imgPool.total
                });
            }, 1000);
            socket.on("disconnect", function () {
                clearInterval(interval);
            });
            socket.on("action", function (data: { action: string }) {
                console.log(data);
                if (data.action == 'resume') {
                    pool.
                    resume();
                        
                    console.log(data.action);
                    socket.emit('actionBack', {action : data.action, data : 'result'}); 
                    
                } else {
                    pool.
                    pause()
                    .then(function(result){
                        console.log(result);
                        console.log(data.action);
                        socket.emit('actionBack', {action : data.action, data : 'result'}); 
                    });
                }
            });
        });
    } else {
        let category: Category = new Category();
        
        
        /*var promisePool = require('promise-pool');
        var num = req.query.num > 60 ? 60 : req.query.num;
        var cateData = {keyword : req.query.info, page : 1};
        var pool = new promisePool.Pool(function (cateData, index) {
            return new Promise(function (resolve, reject) {
                category.getCategoty(cateData.keyword, cateData.page)
                        .then(function(){
                            pool.add();
                        })
                        .catch(function(err){
                            return reject('error');
                        });
            });
            
        }, 5, true);*/
        
        let categoryTask: CategoryTask = {
            info: req.query.info,
            num: req.query.num,
            page: 1,
            widthType: req.query.widthType,
            width: req.query.width ? req.query.width : 0,
            heightType: req.query.heightType,
            height: req.query.height ? req.query.height : 0
        }
        
        category.getCategoty(categoryTask);
        io.on('connection', function (socket: SocketIO.Socket) {
            let interval = setInterval(function () {
                socket.emit('process', {
                    imgFulfilled: global.imgPool.fulfilled,
                    imgRejected: global.imgPool.rejected,
                    imgPending: global.imgPool.pending,
                    imgTotal: global.imgPool.total
                });
            }, 1000);
            socket.on("disconnect", function () {
                clearInterval(interval);
            });
            socket.on("action", function (data: { action: string }) {
                console.log(data);
                if (data.action == 'resume') {
                    global.imgPool.
                    resume();
                        
                    console.log(data.action);
                    socket.emit('actionBack', {action : data.action, data : 'result'}); 
                    
                } else {
                    global.imgPool.
                    pause()
                    .then(function(result){
                        console.log(result);
                        console.log(data.action);
                        socket.emit('actionBack', {action : data.action, data : 'result'}); 
                    });
                }
            });
        });
    }
    
    res.render('reptile', { name : 'reptile', title : '进度页' });
});

app.get('/list', function (req: express.Request, res: express.Response) {
    
    // 分页参数
    let page: Paging = {
        limit:20,
        num:1
    };

    if(req.query.p){
        page.num = req.query.p < 1 ? 1 : req.query.p;
    }
    
    let query = Image.find({});
    query.sort('_id');
    query.limit(page.limit);
    query.skip(page.num * page.limit - page.limit);
    query.exec(function (err: any,results: Document[]) {
        Image.count({},function (error: any, count: number) {
            if (error) {
                console.log(error);
            } else {
                let pageCount = Math.ceil(count / page.limit);
                page.pageCount = pageCount;
                page.size = results.length;
                page.numberOf = pageCount > 5 ? 5 : pageCount;
                console.log(results);
                res.render('list', { images : results, page : page, name : 'list', title : '展示页' });    
            }
        });
    });
    
});

server.listen(1337);

console.log('listening 1337');