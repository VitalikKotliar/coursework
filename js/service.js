/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */

function getCenterLine(x1, x2) {
    return Math.round((x1 + x2) / 2);
}


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function distanceBetweenPoint(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
};


function getWidthInProcent(width, procent) {
    return width / 100 * procent;
};

/**
 * FUNCTION WORK WITH API
 *
 */

function saveGraphOnSever() {
    var graph = {};
    generateAdjacencyMatrix();
    $.ajax({
        url: 'graph/',
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(combineGraph(global.graph)),
        async: false,
        cache: false
    }).done(function (data) {
        graph = data;
        notification.create("Saved", 'info');
    }).error(function () {
        console.log("error");
    });
    return graph;
}


/**
 *
 * ADDITIONAL FUNCTION
 */

function clone(obj) {
    if (obj == null || typeof(obj) != 'object')
        return obj;
    var temp = new obj.constructor();
    for (var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

function combineGraph(graph) {
    //перед отправкрй нужно преобразовать json, в linkх заменить ноуд, с  объекта этой ноды целиком на ее индекс
    //  делаем через функцию клонирования, ато задевает текущую конфигурацию графа
    var tmpGraph = clone(graph);
    for (var i = 0; i < tmpGraph.links.length; i++) {
        tmpGraph.links[i].target = tmpGraph.links[i].target.index;
        tmpGraph.links[i].source = parseInt(tmpGraph.links[i].source.index);
    }
    return tmpGraph;
};

function getNumberNodeByName(json, id) {
    var length = json.length;
    var result = -1;
    for (var i = 0; i < length; i++) {
        if (json[i].name == id)
            result = i;
    }
    ;
    return result;
};

function getNodeByName(name) {
    var length = global.graph.nodes.length;
    for (var i = 0; i < length; i++) {
        if (global.graph.nodes[i].name == name) {
            return global.graph.nodes[i];
        }
    }
    ;
    return undefined;
};

function getLinkById(id) {
    var length = global.graph.links.length;
    for (var i = 0; i < length; i++) {
        if (global.graph.links[i].id == id) {
            return global.graph.links[i];
        }
    }
    ;
    return undefined;
};


function removeNodes(graph, namesNodes) {

    var namesNodesArr = namesNodes.split(',');

    namesNodesArr.map(function (nameNode) {
        var numberNode = getNumberNodeByName(graph.nodes, nameNode);
        if (numberNode != -1) {
            graph.nodes.splice(numberNode, 1); //delete node from array
            for (var i = 0; i < graph.links.length; i++) { //delete links that had node
                if (graph.links[i]['source']['index'] == numberNode
                    || graph.links[i]['target']['index'] == numberNode) {
                    graph.links.splice(i, 1);
                    i--;
                }
                else i++;
            }
            notification.create("Successfully removed", "success");
        }
        else {
            notification.create("Error", "error");
        }
        renderGraph(graph);
    });


};


/**
 * GET DATA FROM SERVER
 */

function getGraphJson() {
    var json = {};
    $.ajax({
        url: '/graph',
        method: 'get',
        async: false,
        cache: false
    }).done(function (data) {
        json = data;
    }).error(function () {
        console.log("error");
    });
    return json;
}

function getListFile() {
    var listFiles = [];
    $.ajax({
        url: '/files',
        method: 'get',
        async: false,
        cache: false
    }).done(function (data) {
        listFiles = data;
    }).error(function () {
        console.log("error");
    });
    return listFiles;
}

function getSelectedFile() {
    var selectedFile;
    $.ajax({
        url: '/file/current',
        method: 'get',
        async: false,
        cache: false
    }).done(function (data) {
        selectedFile = data;
    }).error(function () {
        console.log("error");
    });
    return selectedFile;
}

/**
 * заполняет матрицу смежностти графа, на основе данных с d3
 */

function generateAdjacencyMatrix() {
    global.graph.graphMatrix = [];
    //инициализируем массив
    for (var i = 0; i < global.graph.nodes.length; i++) {
        global.graph.graphMatrix[i] = [];
        for (var j = 0; j < global.graph.nodes.length; j++) {
            global.graph.graphMatrix[i][j] = 0;
        }
    }
    //устанавливаем вес кажого из ребер в нужную ячейку
    for (var k = 0; k < global.graph.nodes.length; k++) {
        for (var l = 0; l < global.graph.links.length; l++) {
            //console.log(k);
            var graphMatrixIndex = global.graph.links[l].source.index;
            if (global.graph.links[l].source.index == k) {
                var linkWeight = getWeihgtLink(global.graph.links[l].absoluteWeight, global.graph.links[l].type);
                //var linkWeight = $filter('calculateLinkWeight')(global.graph.links[l].absoluteWeight, global.graph.links[l].type, global.graph.links[l].satelliteChannel);
                global.graph.graphMatrix[graphMatrixIndex][global.graph.links[l].target.index] = linkWeight;
                global.graph.graphMatrix[global.graph.links[l].target.index][graphMatrixIndex] = linkWeight;
            }
        }
    }
    //this.consoleLogMatrix(this.dataSet.graphMatrix);
};

/**
 *
 * Поиск кратчаейшего пути
 *
 */
function searchShortestPathes(start, nodesCount, matrix) {
    var array = global.graph.nodes;

    var searchTable = [];
    // тут храним текущею и предидущую вершиныЮ для исключения их с проверки
    var vertexArray = [];

    //тут собитраем предков что бы восстановить путь
    var parentsArray = [];
    //финальный массив в котором будут пути для каждо из точек
    var routesArray = [];
    // сначала инициализируем таблицу поиска (всем кроме стартовой вершины - infinity)
    for (var k = 0; k < nodesCount; k++) {
        searchTable[k] = Infinity;
        parentsArray[k] = [];
    }
    // вершину начала поиска обнуляем
    searchTable[start] = 0;
    vertexArray.push(start);
    // n-1 итераций согласно алгоритму
    for (var m = 0; m < array.length - 1; m++) {
        for (var i = 0; i < array.length; i++) {
            vertexArray.push(array[i].index);
            var prevVertex = vertexArray[0];
            var tempVertex = vertexArray[vertexArray.length - 1];
            //console.log("prev vertex" + vertexArray[0]);
            //console.log("temp vertex" + tempVertex);
            for (var j = 0; j < array.length; j++) {
                if (matrix[tempVertex][j] > 0 && matrix[tempVertex][j] + searchTable[tempVertex] < searchTable[j]) {
                    searchTable[j] = matrix[tempVertex][j] + searchTable[tempVertex];
                    parentsArray[j] = tempVertex;
                }
            }
            //console.log(searchTable);
            //console.log("===================");
            vertexArray.shift();
        }
    }
    ;

    //Теперь соберем новый массив, на основе parentsArray, в который запишем сколько узлов нужно
    //прости сообщению с исходной точки до остальных и восстановим путь
    for (var n = 0; n < array.length; n++) {
        if (n != start) {
            routesArray[n] = ({
                'route': [],
                'nodesCount': null
            });
            var prevNode = parentsArray[n];
            routesArray[n].route.push(n);
            while (prevNode != start) {
                routesArray[n].route.push(prevNode);
                prevNode = parentsArray[prevNode]
            }
            //Заканчиваем путь искходой вершиной
            routesArray[n].route.push(parseInt(start));
            //Переворачиваем массив, так как восстанавливали путь с финишной точки пути
            routesArray[n].route.reverse();
            //Добавляем колличество узлов в маршруте
            routesArray[n].nodesCount = routesArray[n].route.length;
        }
    }

    return {
        'searchTable': searchTable,
        'routesArray': routesArray
    };
};

function getWeihgtLink(weight, ifDuplex) {
    var newLinkWeight = weight;
    //if (ifDuplex != 'duplex'){
    //    newLinkWeight *= 2;
    //}
    //if (ifSatelliteChannel){
    //    newLinkWeight *= 3;
    //}
    return newLinkWeight;
}

function getNodeById(nodeId) {
    var result = {};
    var length = global.graph.nodes.length;
    for (var i = 0; i < length; i++) {
        if (global.graph.nodes[i].id == nodeId) {
            result = global.graph.nodes[i];
        }
    }
    return result;
}

function getTimesAndColsPackege(nodeId, packageLength, messageLength, mode) {
    var colSending = Math.ceil(messageLength / (packageLength - 50)); //50 - size header
    var node = getNodeById(nodeId);
    var k = 100;
    var shortestPathResult = searchShortestPathes(node.name, global.graph.nodes.length, global.graph.graphMatrix);
    var shortestPaths = shortestPathResult.searchTable;
    var arrTimeAndColsPackage = [];
    var colPackageService = 0;
    var colPackageInfo = 0;
    shortestPathResult.routesArray.map(function (elem,index) {
        var colNodes = elem.nodesCount;
        var shortestPath = shortestPathResult.searchTable[index];
        if (shortestPath != 0) // без этого добавляет время с вершины в вершину
        {
            if (mode == "logic") {
                if (colNodes == 2){
                    colPackageService = 6;
                }
                else{
                    if (colNodes > 2){
                        colPackageService = colSending*(2*6 + (colNodes - 3)*3);
                    }
                    else{
                        console.log("error");
                    }
                }
            }
            else{
                if (mode == "datagrams") {
                    colPackageService = colSending*(colNodes - 1)*2;
                }
                else{
                    console.log("error");
                }
            }

            colPackageInfo = colSending;



            arrTimeAndColsPackage[index] = {
                time: shortestPath*(colPackageInfo + colPackageService) / k,
                colPackage: {info: colPackageInfo, service: colPackageService},
                paths: elem.route.join(' -> ')
            };
        }
        else
            arrTimeAndColsPackage[index] = {
                time: 0,
                colPackage: {info: 0, service: 0}
            };
    });
    return arrTimeAndColsPackage;
};


