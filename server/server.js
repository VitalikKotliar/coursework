var myFunctions = require('./service'),
    express = require('express'),
    app = express(),
    path = require('path'),
    port = 8080,
    fs = require('fs'),
    rootProject = "/home/vitalik/Projects/course_work_my/", //TODO найти лучшее решение
    pathFilesData = path.join(rootProject + '/server/data'),
    pathJsonFile = path.join(pathFilesData + '/graph.json'),
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
        res.statusCode = 200;
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
        json.nodes.push(
            {
                "name": numberNode,
                "group": 1,
                "fixed": true,
                "x": 60,
                "y": 60
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

app.post('/remove/node', function (req, res) {

    console.log("post request remove node");

    var idNode = req.body.idNode;

    jsonfile.readFile(pathJsonFile, function (err, obj) {
        if (err) res.statusCode = 404;
        var json = obj;

        var numberNode = global.getNumberNodeById(json.nodes, idNode);

        if (numberNode != -1) {
            json.nodes.splice(numberNode, 1); //delete node from array
            //json.nodes[numberNode] = {"fixed":true};
            // remove all link with this node
            for (var i = 0; i < json.links.length; i++) {
                console.log("in for");
                if (json.links[i]['source'] == numberNode || json.links[i]['target'] == numberNode) {
                    json.links.splice(i, 1);
                    i--;
                }
                else i++;
            }
        }
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
 * CRUD end
 */

/**
 * MENU FILES
 */

app.get('/files', function (req, res) {
    console.log("get list files");
    res.statusCode = 200;
    res.send(global.fileNameData);
});

app.post('/file', function (req, res) {
    console.log("change file");
    console.log(req.body);
    if (req.body && req.body['file-graph']) {
        pathJsonFile = path.join(pathFilesData + '/' + req.body['file-graph']);
        res.statusCode = 200;
        console.log(pathJsonFile);
        res.send('successful');
    }
    else{
        res.statusCode = 404;
    }
});


app.listen(port);


console.log("server running " + port);
console.log("http://localhost:8080");