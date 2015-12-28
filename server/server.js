var myFunctions = require('./service'),
    express = require('express'),
    app = express(),
    path = require('path'),
    port = 5656,
    fs = require('fs'),
    rootProject = "/home/vitalik/Projects/course_work_my/", //TODO найти лучшее решение
    pathFilesData = path.join(rootProject + '/server/data/'),
    nameCurrentFile = 'graph.json',
    pathJsonFile = path.join(pathFilesData + nameCurrentFile),
    jsonfile = require('jsonfile'), // for usability read and write file
    bodyParser = require('body-parser'),
    dirPath = rootProject + 'server/data';
global.fileNameData = [];

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

// запишет в global.fileNameData имена файлов с папки dirPath
global.getFileNameInDirectory(dirPath);
/**
 * static files
 */
app.get('/', function (req, res) {
    res.sendFile(path.join(rootProject + '/index.html'));
});

app.get('/*.js|json', function (req, res) {
    res.sendFile(path.join(rootProject + req.url));
});

app.get('/*.css', function (req, res) {
    res.sendFile(path.join(rootProject + req.url));
});

app.get('/fonts/*', function (req, res) {
    res.sendFile(path.join(rootProject + req.url));
});

/**
 * GET GRAPH JSON
 */

app.get('/graph', function (req, res) {
    console.log("get request graph json");
    jsonfile.readFile(pathJsonFile, function (err, obj) {
        if (err) res.statusCode = 200;
        res.send(obj);
    });
});

/**
 * PUT GRAPH JSON
 */

app.put('/graph', function (req, res) {
    console.log("put graph");
    var graph = req.body;
    jsonfile.writeFile(pathJsonFile, graph, function (err) {
        if (err) res.statusCode = 404;
        jsonfile.readFile(pathJsonFile, function (err, obj) {
            if (err) res.statusCode = 400;
            res.send(obj);
            res.statusCode = 200;
        });
    });

});

/**
 * CRUD begin
 */

/**
 * ADD NODE
 */

app.post('/add/node', function (req, res) {
    console.log("post requst add node");

    jsonfile.readFile(pathJsonFile, function (err, obj) {
        if (err) res.statusCode = 404;
        var json = obj;
        //можно было через длино, но невозможно при удалении точек из середины
        //поэтому берем последнее имя и добавляем 1
        var numberNode = parseInt(json.nodes[json.nodes.length - 1].name) + 1;
        var tmpX = 60;
        var tmpY = 60;
        var iteration = 0;
        while (!checkDistance(json.nodes, tmpX, tmpY)) {
            if (iteration > 100) {
                console.log("it is not impossible get coordinates");
                break;
            }
            tmpX += 20;
            iteration++;
        }
        json.nodes.push(
            {
                "name": numberNode,
                "group": 1,
                "fixed": true,
                "x": tmpX,
                "y": tmpY
            }
        );
        jsonfile.writeFile(pathJsonFile, json, function (err) {
            if (err) res.statusCode = 404;
            //возвращаем на клиет весь джсон
            jsonfile.readFile(pathJsonFile, function (err, obj) {
                res.statusCode = 200;
                res.send(obj);
            });
        });
    });
});

/**
 * REMOVE NODE
 */


//app.post('/remove/node', function (req, res) {
//
//    console.log("post request remove node");
//
//    var idNode = req.body.idNode;
//
//    jsonfile.readFile(pathJsonFile, function (err, obj) {
//        if (err) res.statusCode = 404;
//        var json = obj;
//
//        var numberNode = global.getNumberNodeById(json.nodes, idNode);
//
//        if (numberNode != -1) {
//            json.nodes.splice(numberNode, 1); //delete node from array
//            // remove all link with this node
//            for (var i = 0; i < json.links.length; i++) {
//                if (json.links[i]['source'] == numberNode || json.links[i]['target'] == numberNode) {
//                    json.links.splice(i, 1);
//                    i--;
//                }
//                else i++;
//            }
//        }
//        jsonfile.writeFile(pathJsonFile, json, function (err) {
//            if (err) res.statusCode = 404;
//            //возвращаем на клиет весь джсон
//            jsonfile.readFile(pathJsonFile, function (err, obj) {
//                res.statusCode = 200;
//                res.send(obj);
//            });
//        });
//    });
//});


/**
 * ADD LINK
 */

app.post('/add/link', function (req, res) {

    console.log("post requst add link");

    jsonfile.readFile(pathJsonFile, function (err, obj) {
        if (err) res.statusCode = 404;
        var json = obj;
        var source = global.getNumberNodeByName(json.nodes, req.body.source);
        var target = global.getNumberNodeByName(json.nodes, req.body.target);
        console.log(source);
        console.log(target);
        if (source && target) {
            json.links.push(
                {
                    "source": source,
                    "target": target,
                    "value": 5,
                    "weights": req.body.weights
                }
            );
            jsonfile.writeFile(pathJsonFile, json, function (err) {
                if (err) res.statusCode = 404;
                //возвращаем на клиет весь джсон
                jsonfile.readFile(pathJsonFile, function (err, obj) {
                    res.statusCode = 200;
                    res.send(obj);
                });
            });
        }
        else {
            res.statusCode = 400;
            res.send("error");
        }
    });
});


/**
 * REMOVE LINK
 */

app.post('/remove/link', function (req, res) {

    console.log("post requst remove link");

    jsonfile.readFile(pathJsonFile, function (err, obj) {
        if (err) res.statusCode = 404;
        var target = global.getNumberNodeByName(obj.nodes, req.body.target);
        var source = global.getNumberNodeByName(obj.nodes, req.body.source);
        var numberLink = global.getNumberLinkByTrgAndSrc(obj.links, target, source);
        console.log(numberLink);
        if (numberLink != -1) {
            obj.links.splice(numberLink, 1);
            jsonfile.writeFile(pathJsonFile, obj, function (err) {
                if (err) res.statusCode = 404;
                //возвращаем на клиет весь джсон
                jsonfile.readFile(pathJsonFile, function (err, obj) {
                    res.statusCode = 200;
                    res.send(obj);
                });
            });
        }
        else {
            res.statusCode = 400;
            res.send("error");
        }
    });
});

/**
 * MENU FILES
 */

app.get('/files', function (req, res) {
    console.log("get list files");
    res.statusCode = 200;
    res.send(global.fileNameData);
});

app.get('/file/current', function (req, res) {
    console.log("get name current file");
    res.statusCode = 200;
    res.send(nameCurrentFile);
});

app.post('/file', function (req, res) {
    console.log("change file");
    if (req.body && req.body['file-graph']) {
        pathJsonFile = path.join(pathFilesData + req.body['file-graph']);
        nameCurrentFile = req.body['file-graph'];
        res.statusCode = 200;
        res.send('successful');
    }
    else {
        res.statusCode = 404;
    }
});


/**
 * SET LINK PARAMETERS
 */

app.post('/link/parameters', function (req, res) {
    console.log("set parameters node");
    jsonfile.readFile(pathJsonFile, function (err, obj) {
        var idLink = req.body["id-link"];

        if (idLink) {
            var length = obj.links.length;
            var link = {};
            for (var i = 0; i < length; i++) {
                if (obj.links[i].id == idLink) {
                    link = obj.links[i];
                }
            };

            link.isDuplex = req.body["type"];
            jsonfile.writeFile(pathJsonFile, obj, function (err) {
                if (err) res.statusCode = 404;
                //возвращаем на клиет весь джсон
                jsonfile.readFile(pathJsonFile, function (err, obj) {
                    res.statusCode = 200;
                    res.send(obj);
                });
            });
        }
        else
            res.statusCode = 400;
    });
});

app.listen(port);


console.log("server running " + port);
console.log("http://localhost:" + port);