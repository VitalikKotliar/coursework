var myFunctions = require('./function');
var express = require('express');
var app = express();
var path = require('path');
var port = 8080;
var fs = require('fs');
var rootProject = "/home/vitalik/Projects/course_work_my/"; //TODO найти лучшее решение
var pathJsonFile = path.join(rootProject + '/server/graph.json');
var jsonfile = require('jsonfile'); // for usability read and write file
var bodyParser = require('body-parser');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


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
        var numberNode = json.nodes.length + 1;
        console.log(numberNode);
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
    console.log(idNode);
    jsonfile.readFile(pathJsonFile, function (err, obj) {
        if (err) res.statusCode = 404;
        var json = obj;

        var numberNode = global.getNumberNodeById(json.nodes, idNode);

        if (numberNode != -1) {
            //json.nodes.splice(numberNode, 1); //delete node from array
            json.nodes[numberNode] = {"fixed":true};
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

app.listen(port);


console.log("server running " + port);
console.log("http://localhost:8080");