var express = require('express');
var swig = require('swig');
var socket = require('socket.io');
var promisePool = require('promise-pool');
var archiver = require('archiver');
var fs = require('fs');
var image_1 = require('./models/image');
var page_1 = require('./module/page');
var category_1 = require('./module/category');
var app = express();
var server = require('http').Server(app);
/*let bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));*/
var querystring = require('querystring');
app.use('/achive', function (req, res, next) {
    req.rawBody = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        req.rawBody += chunk;
    });
    req.on('end', function () {
        req.rawBody = querystring.parse(req.rawBody);
        next();
    });
});
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });
app.use(express.static('public'));
app.get('/', function (req, res) {
    // 分页参数
    var page = {
        limit: 20,
        num: 1
    };
    if (req.query.p) {
        page.num = req.query.p < 1 ? 1 : req.query.p;
    }
    var query = image_1["default"].find({});
    query.sort('_id');
    query.limit(page.limit);
    query.skip(page.num * page.limit - page.limit);
    query.exec(function (err, results) {
        image_1["default"].count({}, function (error, count) {
            if (error) {
                console.log(error);
            }
            else {
                var pageCount = Math.ceil(count / page.limit);
                page.pageCount = pageCount;
                page.size = results.length;
                page.numberOf = pageCount > 5 ? 5 : pageCount;
                res.render('index', { images: results, page: page, name: 'index', title: '展示页' });
            }
        });
    });
});
app.get('/start', function (req, res) {
    res.render('start', { name: 'start', title: '设置页' });
});
app.get('/reptile', function (req, res) {
    var io = socket(server);
    console.log(req.query.colorpicker);
    if (req.query.type == 0) {
        var page = new page_1["default"]();
        var pool = new promisePool.Pool(function (pageTask, index) {
            return new Promise(function (resolve, reject) {
                page.getPage(pageTask)
                    .then(function (data) {
                    pool.add(data);
                    //console.log(url + ': 获取成功！');
                    return resolve('ok');
                })
                    .catch(function (err) {
                    //console.log(url + ': 获取失败！');
                    return reject('error');
                });
            });
        }, 5, true);
        pool.retries = 5;
        var pageTask = {
            url: req.query.info,
            widthType: req.query.widthType,
            width: req.query.width ? req.query.width : 0,
            heightType: req.query.heightType,
            height: req.query.height ? req.query.height : 0,
            color: req.query.colorpicker ? req.query.colorpicker : '0'
        };
        pool.add(pageTask);
        io.on('connection', function (socket) {
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
            socket.on("action", function (data) {
                console.log(data);
                if (data.action == 'resume') {
                    pool.
                        resume();
                    console.log(data.action);
                    socket.emit('actionBack', { action: data.action, data: 'result' });
                }
                else {
                    pool.
                        pause()
                        .then(function (result) {
                        console.log(result);
                        console.log(data.action);
                        socket.emit('actionBack', { action: data.action, data: 'result' });
                    });
                }
            });
        });
    }
    else {
        var category = new category_1["default"]();
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
        var categoryTask = {
            info: req.query.info,
            num: req.query.num,
            page: 1,
            widthType: req.query.widthType,
            width: req.query.width ? req.query.width : 0,
            heightType: req.query.heightType,
            height: req.query.height ? req.query.height : 0,
            color: req.query.colorpicker ? req.query.colorpicker : '0'
        };
        category.getCategoty(categoryTask);
        io.on('connection', function (socket) {
            var interval = setInterval(function () {
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
            socket.on("action", function (data) {
                console.log(data);
                if (data.action == 'resume') {
                    global.imgPool.
                        resume();
                    console.log(data.action);
                    socket.emit('actionBack', { action: data.action, data: 'result' });
                }
                else {
                    global.imgPool.
                        pause()
                        .then(function (result) {
                        console.log(result);
                        console.log(data.action);
                        socket.emit('actionBack', { action: data.action, data: 'result' });
                    });
                }
            });
        });
    }
    res.render('reptile', { name: 'reptile', title: '进度页' });
});
app.get('/list', function (req, res) {
    // 分页参数
    var page = {
        limit: 20,
        num: 1
    };
    if (req.query.p) {
        page.num = req.query.p < 1 ? 1 : req.query.p;
    }
    var query = image_1["default"].find({});
    query.sort('_id');
    console.log(req.query.paging == 'false');
    if (req.query.paging != 'true') {
        query.limit(page.limit);
        query.skip(page.num * page.limit - page.limit);
    }
    query.exec(function (err, results) {
        image_1["default"].count({}, function (error, count) {
            if (error) {
                console.log(error);
            }
            else {
                console.log(req.query.paging == 'true');
                if (req.query.paging == 'true') {
                    page.limit = count;
                }
                var pageCount = Math.ceil(count / page.limit);
                page.pageCount = pageCount;
                page.size = results.length;
                page.numberOf = pageCount > 5 ? 5 : pageCount;
                res.render('list', { images: results, page: page, name: 'list', title: '展示页', paging: req.query.paging });
            }
        });
    });
});
app.post('/achive', function (req, res) {
    //let rawImages = querystring.parse(req.rawBody);
    //console.log(req.rawBody);
    var rawImages = req.rawBody;
    var imagesArr = [];
    for (var i = 0; i < rawImages.images.length; i++) {
        imagesArr.push('./public/images/' + rawImages.images[i]);
    }
    var zipPath = 'images.zip';
    //创建一最终打包文件的输出流
    var output = fs.createWriteStream(zipPath);
    //生成archiver对象，打包类型为zip
    var zipArchiver = archiver('zip');
    //将打包对象与输出流关联
    zipArchiver.pipe(output);
    for (var i = 0; i < imagesArr.length; i++) {
        console.log(imagesArr[i]);
        //将被打包文件的流添加进archiver对象中
        zipArchiver.append(fs.createReadStream(imagesArr[i]), { 'name': rawImages.images[i] });
    }
    //打包
    zipArchiver.finalize();
    res.render('achive', { images: imagesArr, title: '打包页' });
});
app.get('/delete', function (req, res) {
    var name = req.query.name;
    image_1["default"].remove({ name: name }, function (err) {
        fs.unlink('./public/images/' + name, function (error) {
            res.render('delete', { name: name, err: err || error, title: '删除页' });
        });
    });
});
app.get('/drop', function (req, res) {
    image_1["default"].remove({}, function (err) {
        var folder_exists = fs.existsSync('./public/images');
        if (folder_exists == true) {
            var dirList = fs.readdirSync('./public/images');
            dirList.forEach(function (fileName) {
                if (fileName != '.DS_Store') {
                    fs.unlinkSync('./public/images/' + fileName);
                }
            });
        }
        res.render('drop', { err: err, title: '删除页' });
    });
});
server.listen(1337);
console.log('listening 1337');
