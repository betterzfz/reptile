var bluebird = require('bluebird');
var request = require('request');
var _ = require('underscore');

var Tkproxy = function () {
    this.ips = {};
};

Tkproxy.prototype.getProxy = function (num) {
    var that = this;
    return new bluebird.Promise(function (resolve, reject) {
        // 这里取ip然后把ip格式化到数据里面去
        request('http://www.tkdaili.com/api/getiplist.aspx?vkey=CD2C8F10D114BAE795CA1717C1A1F495&num='
        + num + '&password=haozi&style=3&jdfwkey=ktbze', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var p = body.trim().split('\r\n');
                return resolve(p);
            }
            return reject('tk site get ips failed, check if acount unavaliable');
        })
    });
};

Tkproxy.prototype.verifyOneProxy = function (ip, seconds) {
    return new bluebird.Promise(function (resolve, reject) {
        console.time(ip);
        request({
            url: 'http://www.baidu.com',
            proxy: 'http://' + ip,
            timeout: seconds * 1000
        }, function (err, res, body) {
            if (!err && res.statusCode == 200) {
                console.timeEnd(ip);
                return resolve(ip);
            }
            return resolve(false);
        })
    });
};

Tkproxy.prototype.keepProxyPool = function (wantCount, timeLimit) {
    var that = this;
    return new bluebird.Promise(function (resolve, reject) {
        console.log('getting proxy list');
        return that.getProxy(wantCount)
            .map(function (d) {
                //console.log(d);
                return that.verifyOneProxy(d, timeLimit);
            })
            .then(function (d) {
                _.each(d, function (e, i, l) {
                    if (e) {
                        that.ips[e] = 1;
                    }
                });
                return resolve(that.ips);
            })
    });
};
Tkproxy.prototype.getAll = function () {
    return this.ips;
};

Tkproxy.prototype.delOneProxy = function (ip, force) {
    this.ips[ip] && this.ips[ip]++;
    // 增加失败次数记录
    if (this.ips[ip] > 50 || force !== undefined) {
        try {
            delete this.ips[ip];
        }
        catch (e) {
            //console.log('删除 代理ip失败！！！！！！！！');
            //console.log(e);
        }
    }
    return this.ips;
};

Tkproxy.prototype.getOneProxy = function () {
    if (Object.keys(this.ips).length > 0) {
        return _.sample(Object.keys(this.ips));
    }
    else {
        return false;
    }
};

Tkproxy.prototype.start = function (proxyNum) {
    var that = this;
    setInterval(function () {
        //console.log('tick');
        if (Object.keys(that.ips).length < proxyNum) {
            console.log('ip not enough');
            that.keepProxyPool(proxyNum, 5)
                .then(function (d) {
                    //console.log(d);
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
    }, 10 * 1000);

};

module.exports = Tkproxy;