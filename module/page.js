var fs = require('fs');
var bluebird = require('bluebird');
var request = require('request');

var Page = function () {
};

Page.prototype.getPage = function (url) {
    
    return new Promise(function (resolve, reject) {
        
        request({  
            url: url,
            headers: {
                'User-Agent': 'request'
            }
        },function(error, response, body) {  
            if (!error && response.statusCode == 200) {
                var reg = /<a.+?href=('|")?([^'"]+)('|")?(?:\s+|>)/gim;
                var arr = [];
                var tem;
                while (tem = reg.exec(body)) {
                    if (tem[2].indexOf('http') == 0) {
                        arr.push(tem[2]);
                    } else {
                        arr.push(url + tem[2]);
                    }
                }
                return resolve(arr);
            } else {
                return reject(error);
            }
        });
    });
};

module.exports = Page;

