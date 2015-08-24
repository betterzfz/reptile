var express = require('express');
var path = require('path')
var app = express();
var swig = require('swig');
var Image = require('./models/image');
console.log('正在配置请求');
app.engine('html',swig.renderFile);
app.set('view engine','html');
app.set('views',__dirname+'/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });
app.use(express.static('public'));
console.log('正在准备查询');
app.get('/', function (req, res) {
    console.log('配置查询参数');
    var page = {limit:20,num:1};
    console.log(req.query);
    if(req.query.p){
        page.num = req.query.p < 1 ? 1 : req.query.p;
    }
    
    Image.find().sort('_id').skip(page['num'] * page['limit'] - page['limit']).limit(page['limit']).exec(function(err,results){
        if(err){
            console.log(err);
        } else {
            Image.count({},function(error, count){
                if(error){
                    console.log(error);
                } else {
                    var pageCount = Math.ceil(count / page['limit']);
                    page['pageCount'] = pageCount;
                    page['size'] = results.length;
                    page['numberOf'] = pageCount > 5 ? 5 : pageCount;
                    res.render('index',{images:results,page:page});
                                        
                    
                }
            });
        }
    });
});

app.listen(1337);
console.log('listening 1337');