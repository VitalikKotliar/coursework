/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 24.12.15
 */

var fs = require('fs');
var path = require('path');

function distanceBetweenPoint(x1,y1,x2,y2){
    return Math.sqrt(Math.pow((x1 - x2),2) + Math.pow((y1 - y2),2));
};

global.getNumberNodeByName = function (json, name) {
    var length = json.length;
    var result = undefined;
    for (var i = 0; i < length; i++) {
        if (json[i].name == name)
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

global.getNumberLinkByTrgAndSrc = function (json,target,source) {
    var length = json.length;
    var result = -1;
    for (var i = 0; i < length; i++) {
        if (json[i].source == source && json[i].target == target ||
            json[i].source == target && json[i].target == source
        )
            result = i;
    };
    return result;
};

global.checkDistance = function(nodes,x1, y1) {
    //проходим по массиву нодов и проверяем растояния
    var flag = true;
    nodes.map(function (node) {
        if (distanceBetweenPoint(x1, y1, node.x, node.y) < 50) {
            flag = false;
        }
    });
    return flag;
}
