var fs = require('fs');
var request = require('request');
//var ws = fs.createWriteStream('./public/images/61886f22-4e11-11e5-8378-cb38ed306fb4.jpg');
request('http://www.jstv.com/n/ws/xtslf/jjl/z4/201305/W020130503536532879526.jpg').pipe(fs.createWriteStream('./public/images/61886f22-4e11-11e5-8378-cb38ed306fb4.jpg'));
        /*request
            .get({
                url: 'http://img3.imgtn.bdimg.com/it/u=867102852,1397331561&fm=21&gp=0.jpg',
                timeout: 20 * 1000
            })
            .on('error', function (err) {
                console.log(err);
            })
            .pipe(ws)
            .on('close', function(){
                console.log('./public/images/61886f22-4e11-11e5-8378-cb38ed306fb4.jpg');
            })*/