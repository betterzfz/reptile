var express = require('express');
var path = require('path')
var app = express();
var swig = require('swig');
app.engine('html',swig.renderFile);
app.set('view engine','html');
app.set('views',__dirname+'/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });
app.use(express.static('public'));
app.listen(1337);
console.log('listening 1337');