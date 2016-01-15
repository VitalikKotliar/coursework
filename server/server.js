var myFunctions = require('./service'),
    express = require('express'),
    app = express(),
    path = require('path'),
    port = 5656,
    fs = require('fs'),
    rootProject = global.appRoot, //TODO найти лучшее решение
    pathFilesData = path.join(rootProject + '/server/data/'),
    nameCurrentFile = 'graph.json',
    pathJsonFile = path.join(pathFilesData + nameCurrentFile),
    jsonfile = require('jsonfile'), // for usability read and write file
    bodyParser = require('body-parser'),
    dirPath = rootProject + '/server/data';

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
 * ADD LINK
 */

app.post('/add/link', function (req, res) {

    console.log("post requst add link");

    jsonfile.readFile(pathJsonFile, function (err, obj) {
        if (err) res.statusCode = 404;
        var json = obj,
            source = global.getNumberNodeByName(json.nodes, req.body.source),
            target = global.getNumberNodeByName(json.nodes, req.body.target),
            linkId = source + '-' + target;

        if (source && target && req.body.type
            && source != target
            && !global.getLinkById(json.links, linkId)) {
            var tmp = {
                "source": source,
                "target": target,
                "value": 5,
                "weight": parseInt(req.body.weight),
                "isDuplex": req.body.type,
                "id": linkId
            };
            tmp.absoluteWeight = (tmp.isDuplex == 1) ? tmp.weight * 2 : tmp.weight;

            json.links.push(tmp);
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
    console.log("set parameters link");
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

            link.isDuplex = parseInt(req.body["type"]);
            link.weight = req.body["weightLink"];
            link.absoluteWeight = (link.isDuplex == 1) ? link.weight * 2 : link.weight;

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

/**
 * SET NODE PARAMETRS
 */

app.post('/node/parameters', function (req, res) {
    console.log("set parameters node");
    jsonfile.readFile(pathJsonFile, function (err, obj) {
        var nodeId = req.body["id-node"];

        if (nodeId) {//TODO вынести в отдельную фукцию поиск нода по айди
            var length = obj.nodes.length;
            var node = {};
            for (var i = 0; i < length; i++) {
                if (obj.nodes[i].id == nodeId) {
                    node = obj.nodes[i];
                }
            }
            ;

            node['messageLength'] = req.body["messageLength"];

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