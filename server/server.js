var myFunctions = require('./service');
    express = require('express'),
    app = express(),
    path = require('path'),
    port = 8080,
    fs = require('fs'),
    rootProject = "/home/vitalik/Projects/course_work_my/", //TODO найти лучшее решение
    pathJsonFile = path.join(rootProject + '/server/data/graph.json'),
    jsonfile = require('jsonfile'), // for usability read and write file
    bodyParser = require('body-parser');



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
 * PUT GRAPH JSON
 */

app.put('/graph', function (req, res) {
    console.log("put graph");
    var graph = req.body;
    console.log(typeof graph);
    jsonfile.writeFile(pathJsonFile, graph, function (err) {
        console.log(err);
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
//
//app.post('/file', function (req, res) {
//    console.log(req.body);
//    res.statusCode = 200;
//    res.send("sdfasdf");
//});


app.listen(port);


console.log("server running " + port);
console.log("http://localhost:8080");