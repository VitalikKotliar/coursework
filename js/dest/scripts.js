/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */
addEventListener("DOMContentLoaded", function () {

    var $forms = $('.js-simple-form');

    $forms.on("submit", function (e) {
        global.backup.addBackup();

        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);
        $.ajax({
            url: this.action,
            method: this.method,
            data: $this.serialize(),
            cache: false
        }).done(function (data) {
            renderGraph(data);
        }).error(function () {
            console.log("error");
            notification.create("Ошибка","error");
        });
    });

    $('.js-save').on('click', function () {
        saveGraphOnSever();
    });

    $('.js-remove-node').on('click', function (e) {
        global.backup.addBackup();

        e.stopPropagation();
        e.preventDefault();

        var namesNodes = $(this).closest('form').find('input').val();

        removeNodes(global.graph,namesNodes);

        saveGraphOnSever();
    });
    $('.js-file-graph').on('change', function (e) {
        global.backup.backupData = [];

        e.preventDefault();
        e.stopPropagation();

        var $this = $(this);
        $.ajax({
            url: '/file',
            method: 'post',
            data: {'file-graph': this.value},
            cache: false
        }).done(function (data) {
            renderGraph();
        }).error(function () {
            console.log("error");
        });
    });

    /**
     * UNDO , REDO
     */

    $('.js-undo').on('click', function () {
        global.backup.undo();

    });

    $('.js-redo').on('click', function () {
        global.backup.redo();
    });
});

/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 22.05.2015
 */
var inputData = {
    weight: [3, 4, 5, 7, 11, 12, 15, 17, 19, 24]
};

var global = {
    templates: {},
    setting: {
        radiusNode: 15
    },
    backup: {
        backupData: [],
        currentIndexObj: 0,
        //TODO сделать более продуманный алгоритм
        addBackup: function () {
            //затираем все при добавления бекапа, нужно при добавления новых данных
            // в середину массива
            this.backupData.splice(this.currentIndexObj + 1, this.backupData.length);
            this.currentIndexObj = this.backupData.push(clone(global.graph));
        },
        undo: function () {
            var index = this.currentIndexObj;
            var backup = this.backupData[index - 1];
            if (!this.backupData[index + 1]) { //для возможности перехода вперед
                this.addBackup();
            }
            if (backup) {
                global.graph = backup;
                renderGraph(saveGraphOnSever());
                this.currentIndexObj = index - 1;
            }
        },
        redo: function () {
            var backup = this.backupData[this.currentIndexObj + 1];
            if (backup) {
                global.graph = backup;
                renderGraph(saveGraphOnSever());
                this.currentIndexObj++;
            }
        }
    }
};


function initWindow() {
    var height = window.innerHeight;
    var width = window.innerWidth;


    global.force = d3.layout.force()
        //.charge(-120)
        //.linkDistance(30)
        .size([width, height]);

    global.svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height);
};

function renderGraph(jsonGraph) {
    global.svg.html("");

    var color = d3.scale.category20();

    global.graph = jsonGraph || getGraphJson();
    console.log("in render = ", global.graph);
    global.force
        .nodes(global.graph.nodes)
        .links(global.graph.links)
        .start();

    //create links
    //логично сначала прорисовать ноды потом линки,
    // но ноды дожны быть выше в дом дереве что бы они показывались выше ликов
    var linksWrapper = global.svg.selectAll(".link")
        .data(global.graph.links)
        .enter().append("g");

    var linkLine = linksWrapper
        .append('line')
        .attr("class", "link-line")
        .style("stroke-width", function (d) {
            return Math.sqrt(d.weight);
        });

    //append element text in each linkWrapper
    var linkText = linksWrapper
        .append('text')
        .html(function (d) {
            return d.weight; //get from current object link, that we take from json
        })
        .attr("class", "link-text");


    //добавляем g куда будем ложить саму точку и текст
    var nodesWrapper = global.svg.selectAll(".node")
        .data(global.graph.nodes)
        .enter().append("g")
        .style("fill", function (d) {
            return color(d.group);
        })
        .call(global.force.drag);

    var nodeCircle = nodesWrapper
        .append('circle')
        .attr("class", "node-circle")
        .attr("r", global.setting.radiusNode);

    //append element text in each nodeWrapper
    var nodeText = nodesWrapper
        .append('text')
        .html(function (d) {
            return d.name; //get from current object node, that we take from json
        })
        .attr("class", "node-text");

    //в функции выполняется просчет кординат, спецефична и обязательно для бибилотеки d3
    global.force.on("tick", function () {
        linkLine.attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        linkText.attr('x', function (d) {
                return getCenterLine(d.source.px, d.target.px);
            })
            .attr('y', function (d) {
                return getCenterLine(d.source.py, d.target.py);
            });

        nodeCircle.attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
        nodeText
            .attr("x", function (d) {
                var halfWeight = d3.select(this).node().getBBox().width / 2;
                return (d.x - halfWeight);
            })
            .attr("y", function (d) {
                return d.y + 7;
            });
    });
};

function initMenu() {
    var $selectFiles = $('.js-file-graph');
    var $selectWeight = $('.js-link-weight');

    $selectFiles.append(global.templates["js-template-select"]({data: getListFile()}));
    $selectWeight.append(global.templates["js-template-select"]({data: inputData.weight}));

}
addEventListener("DOMContentLoaded", function () {

    /**
     *
     * TEMPLATES COMPILING
     */

    var $templates = $('.js-templates');

    Array.prototype.map.call($templates, function (elem) {
        var source = $(elem).html();
        global.templates[elem.id] = Handlebars.compile(source);
    });

    /**
     * INIT D3
     */
    initMenu();
    initWindow();
    renderGraph();
});
/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 20.12.15
 */

Object.size = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

Object.min = function (obj) {
    var keys = Object.keys(obj);
    keys.map(function (element, i) {
        keys[i] = parseInt(element);
    });
    return Math.min.apply(null, keys);
};

notification = {
    notifications: {},
    counter: 0,
    create: function (text, type, seconds) {
        if (Object.size(this.notifications) > 4) {
            this.remove(Object.min(this.notifications));
        }

        var newNotification = {};
        newNotification.node = document.createElement("div");
        console.log(newNotification.node);
        newNotification.node.innerText = text || "notification";
        newNotification.node.className = "notification " + (type || "info");

        newNotification.timeOut = setTimeout(function () {
            notification.remove(newNotification.id);
        }, seconds || 8000);


        newNotification.node.addEventListener('click', function () {
            notification.remove(newNotification.id);
        });
        var wrNotification = document.getElementById("wr-notification");
        if (!wrNotification){
            var newNode = document.createElement("div");
            newNode.setAttribute('class','wr-notification');
            document.getElementsByTagName('body')[0].appendChild(newNode);
            wrNotification = newNode;
        }
        wrNotification.appendChild(newNotification.node);
        newNotification.id = this.counter;
        this.notifications[this.counter] = newNotification;
        this.counter++;

    },
    remove: function (id) {
        if (!notification.notifications[id]) return; //для случая когда было нажато и закончился таймаут
        var node = notification.notifications[id].node;
        clearTimeout(notification.notifications[id].timeOut);
        this.animation(node,function(){
            node.parentNode.removeChild(node);
        });
        delete notification.notifications[id];
    },
    animation: function(node,callback){
        node.style.opacity = 0.8;
        var interval = setInterval(function(){
            var opacity = node.style.opacity - 0.01;
            node.style.opacity = opacity;
            if (opacity < 0) {
                clearInterval(interval);
                typeof callback == "function" ? callback() : false
            }
        },20);
    }
};




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
