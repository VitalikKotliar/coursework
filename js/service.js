/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */

function getCenterLine(x1, x2) {
    return Math.round((x1 + x2) / 2);
}


/**
 * FUNCTION WORK WITH API
 *
 */

function getGraphJson() {
    var json = {};
    $.ajax({
        url: '/graph',
        method: 'get',
        async:false
    }).done(function (data) {
        console.log(json);
        json = data;
    }).error(function () {
        console.log("error");
    });
    console.log(json);
    return json;
}

function saveGraphOnSever() {
    var graph = {};
    $.ajax({
        url: 'graph/',
        method: 'PUT',
        dataType: 'json',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(combineGraph(global.graph)),
        async:false
    }).done(function (data) {
        graph = data;
    }).error(function () {
        console.log("error");
    });
    return graph;
}



/**
 *
 * ADDITIONAL FUNCTION
 */

function clone(obj){
    if(obj == null || typeof(obj) != 'object')
        return obj;
    var temp = new obj.constructor();
    for(var key in obj)
        temp[key] = clone(obj[key]);
    return temp;
}

function combineGraph(graph){
    //перед отправкрй нужно преобразовать json, в ребрах заменить ноуд, с  объекта этой ноды целиком на ее индекс
    //  делаем через функцию клонирования, ато задевает текущую конфигурацию графа
    var tmpGraph = clone(graph);
    for (var i=0; i < tmpGraph.links.length;i++){
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
    };
    return result;
};


function removeNodes(graph, namesNodes) {

    console.log(namesNodes);
    var namesNodesArr = namesNodes.split(',');

    namesNodesArr.map(function(nameNode){
        console.log(nameNode);
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
        }
        else{
            notification.create("Ошибка","error");
        }
        renderGraph(graph);
    });


};

/**
 * MENU FILES
 */

function getListFile() {
    var listFiles = [];
    $.ajax({
        url: '/files',
        method: 'get',
        async:false
    }).done(function (data) {
        listFiles = data;
    }).error(function () {
        console.log("error");
    });
    return listFiles;
}
