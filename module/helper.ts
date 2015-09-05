import * as fs from 'fs';
import * as bluebird from 'bluebird';
import * as readChunk from 'read-chunk'; 
import * as fileType from 'file-type';

let Helper = function () {
};

Helper.prototype.isExist = function (file) {
    
    return new bluebird.Promise(function (resolve, reject) {
        fs.exists(file, function (exists) {
            if (exists) return resolve(true);
            else return resolve(false);
        });
    })
};

Helper.prototype.isValidImg = function (file) {
    var that = this;
    var tmp_filename = file;
    return that
        .isExist(tmp_filename)
        .then(function (isExistResult) {
            if (isExistResult) {
                var buffer = readChunk.sync(file, 0, 262);
                var result = fileType(buffer);


                return result && (result.ext == 'jpg' || result.ext == 'png' || result.ext == 'gif');
                
            }
            throw new Error('文件不存在');
        });
};

module.exports = Helper;