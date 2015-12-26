/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 24.12.15
 */

var fs = require('fs');
var path = require('path');


global.getNumberNodeById = function (json, id) {
    var length = json.length;
    var result = -1;
    for (var i = 0; i < length; i++) {
        if (json[i].name == id)
            result = i;
    };
    return result;
};

global.getFileNameInDirectory = function (dirPath) {
    var files = [];
    var fileType = '.' + 'json';
    fs.readdir(dirPath, function (err, list) {
        if (err) throw err;
        for (var i = 0; i < list.length; i++)
            if (path.extname(list[i]) === fileType) {
                files.push(list[i]); //store the file name into the array files
            }
        global.fileNameData = files;
    });
};