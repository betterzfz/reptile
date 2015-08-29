var express = require('express');
var path = require('path')
var app = express();
var server = require('http').Server(app);
var swig = require('swig');
var Image = require('./models/image'); //图片模型

app.engine('html',swig.renderFile);
app.set('view engine','html');
app.set('views',__dirname+'/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });
app.use(express.static('public'));

app.get('/', function (req, res) {
    
    var page = {limit:20,num:1};

    if(req.query.p){
        page.num = req.query.p < 1 ? 1 : req.query.p;
    }
    
    Image.find().sort('_id').skip(page.num * page.limit - page.limit).limit(page.limit).exec(function(err,results){
        if(err){
            console.log(err);
        } else {
            Image.count({},function(error, count){
                if(error){
                    console.log(error);
                } else {
                    var pageCount = Math.ceil(count / page.limit);
                    page.pageCount = pageCount;
                    page.size = results.length;
                    page.numberOf = pageCount > 5 ? 5 : pageCount;
                    res.render('index', { images : results, page : page, name : 'index', title : '展示页' });                
                }
            });
        }
    });
});

app.get('/start', function(req, res){
    res.render('start', { name : 'start', title : '设置页' });
});

app.get('/reptile', function(req, res){
    console.log(req.query.type);
    console.log(req.query.info);
    var io = require('socket.io')(server);
    
    if(req.query.type == 0){
        var promisePool = require('promise-pool');
        var Page = require('./module/page');
        var page = new Page();
        var pool = new promisePool.Pool(function (url, index) {
            return new Promise(function (resolve, reject) {
                page.getPage(url)
                    .then(function(data){
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
        pool.add(req.query.info);
        
        /*pool.start(onProgress).then(function(result) {
            console.log('完成 ' + result.total + ' 个页面任务.');
        });*/
        io.on('connection', function (socket) {
            var interval = setInterval(function () {
                socket.emit('process', {
                    fulfilled: pool.fulfilled,
                    rejected: pool.rejected,
                    pending: pool.pending,
                    total: pool.total,
                    imgFulfilled: imgPool.fulfilled,
                    imgRejected: imgPool.rejected,
                    imgPending: imgPool.pending,
                    imgTotal: imgPool.total
                });
            }, 1000);
            socket.on("disconnect", function () {
                clearInterval(interval);
            });
            socket.on("action", function (data) {
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
        function onProgress(progress) {
            if (progress.success) {
                
                //console.log(progress.fulfilled + '/' + progress.total);
            } else {
                //console.log('页面任务 ' + progress.index + ' 因为 ' + (progress.error ? progress.error.message : '没有错误') + ' 而失败, 还可以进行 ' + progress.retries + '次');
            }
        }
    } else {
        var Category = require('./module/category');
        var category = new Category();
        
        
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
        
        
        
        category.getCategoty(req.query.info, req.query.num, 1);
        io.on('connection', function (socket) {
            var interval = setInterval(function () {
                socket.emit('process', {
                    imgFulfilled: imgPool.fulfilled,
                    imgRejected: imgPool.rejected,
                    imgPending: imgPool.pending,
                    imgTotal: imgPool.total
                });
            }, 1000);
            socket.on("disconnect", function () {
                clearInterval(interval);
            });
            socket.on("action", function (data) {
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
    }
    
    res.render('reptile', { name : 'reptile', title : '进度页' });
});

server.listen(1337);

console.log('listening 1337');