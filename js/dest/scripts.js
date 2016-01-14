/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */

addEventListener("DOMContentLoaded", function () {


    $(window).resize(function () {
        initWindow();
        renderGraph();
    });

    var $body = $('body');

    $body.on("submit", '.js-simple-form', function (e) {
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
            $('.modal').modal('hide');
            renderGraph(data);
        }).error(function () {
            console.log("error");
            notification.create("Error", "error");
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

        removeNodes(global.graph, namesNodes);

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

    //$('.node-circle').on('click',function(){
    //    console.log("click");
    //});
    /**
     * UNDO , REDO
     */

    $('.js-undo').on('click', function () {
        global.backup.undo();

    });

    $('.js-redo').on('click', function () {
        global.backup.redo();
    });

    //$('.js-all-nodes-left').on('click',function(){
    //    console.log(global.graph.nodes);
    //    global.graph.nodes.map(function (node,index) {
    //        global.graph.nodes[index] = node.x - 30;
    //    });
    //    console.log(global.graph.nodes);
    //    saveGraphOnSever();
    //    renderGraph();
    //});


    $('.js-random-graph').on('click', function () {
        $('.modal-random-graph').modal('toggle');
    });

    $('.js-random-graph-confirmation').on('click', function () {
        renderGraph(createRandomGraph());
        saveGraphOnSever();
    });

    $('body').on('click', '.cancel', function () {
        $(this).closest('.modal').modal('hide');
    });

    $('.js-shortest-way').on('click', function () {
        var valInput = $(this).closest('.js-wr').find('input').val(),
            nodeNumber = getNumberNodeByName(global.graph.nodes, valInput),
            shortestPathes = searchShortestPathes(nodeNumber, global.graph.nodes.length, global.graph.graphMatrix),
            $modalTable = $('.modal-table');

        $modalTable.empty().append(global.templates["js-template-table"]({
            data: shortestPathes,
            title: 'Table маршрутизации для node № ' + valInput
        }));
        $modalTable.modal('toggle');
    });


    /**
     * MENU UI
     */

    $('.js-toggle-menu').on('click', function (e) {
        var $this = $(this);
        var $menu = $this.closest('.wr-menu');
        var $inner = $this.closest('.wr-menu').find('.wr-inner');

        if ($menu.hasClass('on')) {

            $menu.animate({width: '30'}, 100);
            $inner.animate({opacity: '0'}, 100);
            $menu.removeClass('on');

        }
        else {
            $menu.animate({width: '20%'}, 100);
            $inner.animate({opacity: '1'}, 100);
            $menu.addClass('on');
        }
    });

    $('.js-section-title').on('click', function () {
        var $this = $(this);
        $this.toggleClass('on')
            .closest('.js-section').find('.js-section-content')
            .animate({height: 'toggle'}, 350);
    });


    //var nodeCircle = d3.selectAll('.node');
    //nodeCircle.on('click', function () {
    //    saveGraphOnSever();
    //});

    /**
     * HANDLERS EVENT ON GRAPH
     *
     */

    var $svg = $('svg');

    $svg.on('click', '.node', function () {
        saveGraphOnSever();
    });

    $svg.on('dblclick', '.node', function () {
        var idNode = $(this).data('id'),
            nodeName = $(this).data('name'),
            $modalNodeParam = $('.js-modal-node-parameters'),
            messageLength = $(this).data('messageLength') || inputData.defaultMessageLength;
        $modalNodeParam.empty().append(global.templates["js-modal-node-parameters"]({
            idNode: idNode,
            nodeName: nodeName,
            messageLength: messageLength
        }));
        $modalNodeParam.modal('toggle');
    });
    //$('.node')
    //    .data('toggle', 'popover')
    //    .data('title', 'Popover title')
    //    .data('content', "And here's some amazing content. It's very engaging. Right?").popover();

    $svg.on('click', '.link', function () {
        var $this = $(this),
            $modalParamLinks = $('.js-modal-link-parameters'),
            idLink = $(this).data('id'),
            link = getLinkById(idLink);

        var newVar = {
            linkName: link.source.name + ' - ' + link.target.name,
            idLink: idLink,
            isDuplex: link.isDuplex,
            isHalfDuplex: link.isDuplex ? 0 : 1
        };
        $modalParamLinks.empty().append(global.templates["js-modal-link-parameters"](newVar));
        $modalParamLinks.modal('toggle');
    });

    /**
     * handlers for nodes parameters in modal window
     */

    $body.on('click', '.js-table-shortest-way', function () {
        var $this = $(this),
            valInput = $this.closest('form').find('input[name="name-node"]').val(),
            nodeNumber = getNumberNodeByName(global.graph.nodes, valInput),
            shortestPathes = searchShortestPathes(nodeNumber, global.graph.nodes.length, global.graph.graphMatrix),
            $modalTable = $('.modal-table');

        $(this).closest('.modal').modal('hide');

        var arr = [];

        shortestPathes.routesArray.forEach(function (elem, index) {
            arr[index] = {
                index : index,
                shortestPath : shortestPathes.searchTable[index],
                path : shortestPathes.routesArray[index]['route'].join(' -> ')

            }
        });

        setTimeout(function () { //задержка для того что прошлый попап успел скрыться
            $modalTable.empty().append(global.templates["js-template-table"]({
                data: arr,
                title: 'Table маршрутизации для node № ' + valInput
            }));
            $modalTable.modal('toggle');
        }, 800);
    });

    $body.on('click', '.js-table-time', function () {
        var $this = $(this),
            nodeName = $this.closest('form').find('input[name="name-node"]').val(),
            nodeId = $this.closest('form').find('input[name="id-node"]').val(),
            messageLength = $this.closest('form').find('input[name="messageLength"]').val(),
            $modalTable = $('.js-modal-table-time');

        $(this).closest('.modal').modal('hide');

        var node = getNodeById(nodeId);


        var matrixForTableTime = [];
        var packagesSize = [1050, 2050, 3050];

        packagesSize.forEach(function (packageLength, i) {
            matrixForTableTime[i] = getTimesAndColsPackege(nodeId, packageLength, messageLength, "logic");
            matrixForTableTime[i + 3] = getTimesAndColsPackege(nodeId, packageLength, messageLength, "datagrams");
        });


        var tmpObj = {};
        var weightPaths = searchShortestPathes(node.name, global.graph.nodes.length, global.graph.graphMatrix).searchTable;
        //переганяем в удобный вид для шаблонизатора.
        matrixForTableTime[0].forEach(function (elem,index) {
            tmpObj[index] = {};
            var tmp = tmpObj[index];
            tmp.nodeName = index;
            tmp.weightPath = weightPaths[index];
            tmp.paths = matrixForTableTime[0][index].paths;
            for (var j = 0; j < packagesSize.length; j++) {
                tmp["arrLogic" + packagesSize[j]] = matrixForTableTime[j][index];
                tmp["arrDatagram" + packagesSize[j]] = matrixForTableTime[j + 3][index];
            }
        });
        setTimeout(function () { //задержка для того что прошлый попап успел скрыться
            $modalTable.empty().append(global.templates["js-modal-table-time"]({
                data: tmpObj,
                nodeName: nodeName,
                messageLength: messageLength
            }));
            $modalTable.modal('toggle');
        }, 800);
    });
})
;

/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 22.05.2015
 */
var inputData = {
    weights: [3, 4, 5, 7, 11, 12, 15, 17, 19, 24],
    minColLink: 4,
    colNodeInRegionNetwork: 12,
    defaultMessageLength:1500,
    maxSizePackage:1000
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
    global.height = $(window).height();
    global.width = $(window).width();
    //global.svgWidth = window.innerWidth / 100 * 80;

    global.force = d3.layout.force()
        //.charge(-120)
        //.linkDistance(30)
        .size([global.width, global.height]);

    global.svg = d3.select("svg")
        .attr("width", global.width)
        .attr("height", global.height);
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
        .enter().append("g")
        .attr('data-id', function (d) {
            return d.id;
        })
        .attr('class', function (d) {
            var classes = "link ";
            d.isDuplex == 1 ? classes += "duplex" : classes += "half-duplex";
            return classes;
        })

    var linkLine = linksWrapper
        .append('line')
        .attr("class", "link-line");
    //.style("stroke-width", function (d) {
    //    return d.weight / 5;
    //});

    //append element text in each linkWrapper
    var linkText = linksWrapper
        .append('text')
        .html(function (d) {
            return d.absoluteWeight;
        })
        .attr("class", "link-text");


    //добавляем g куда будем ложить саму точку и текст
    var nodesWrapper = global.svg.selectAll(".node")
        .data(global.graph.nodes)
        .enter().append("g").attr('data-id', function (d) {
            return d.id;
        })
        .attr('class', 'node')
        .attr('data-name', function (d) {
            return d.name;
        })
        .attr('data-message-length', function (d) {
            return d['messageLength'];
        })
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
    $selectFiles.val(getSelectedFile());
    $selectWeight.append(global.templates["js-template-select"]({data: inputData.weights}));

}
/**
 *
 * TEMPLATES COMPILING
 */

function initTemplates() {
    var $templates = $('.js-templates');

    Array.prototype.map.call($templates, function (elem) {
        var source = $(elem).html();
        global.templates[elem.id] = Handlebars.compile(source);
    });
}

addEventListener("DOMContentLoaded", function () {
    initTemplates();
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
        newNotification.node.innerHTML = text || "notification";
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
            newNode.setAttribute('id','wr-notification');
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
        node.style.opacity = 1;
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
 * Date: 27.12.15
 */

function createRandomGraph() {
    var graph = {},
        colNodeInRegionNetwork = 12,
        nameNode = 0,
        idNode = 0,
        width = global.width/100 * 80,
        padding = getWidthInProcent(width,10), //отступ от краев 10 проценво
        topBorder = padding,
        bottomBorder = global.height - padding,
        leftBorder = padding,
        rightBorder = width - padding,
    //minDistance = getWidthInProcent(5);
        minDistance = 75;

    function createNodes() {
        function addNode(x, y) {
            var node = {};
            node.x = x;
            node.y = y;
            node.name = nameNode;
            node.id = idNode;
            node.group = 1;
            node.fixed = 1;
            graph.nodes.push(node);
            nameNode++;
            idNode++;
        };
        function createTwoCenterPoint() {
            var centerX = width / 2,
                centerY = global.height / 2,
                procentWidth = width / 100 * 5;
            addNode(centerX - procentWidth, centerY);
            addNode(centerX + procentWidth, centerY);
        };
        function createElsePoint(lLimit, rLimit) {
            function addLeftSection(leftBor, rightBor) {
                function checkDistance(x1, y1) {
                    //проходим по массиву нодов и проверяем растояния
                    var flag = true;
                    graph.nodes.map(function (node) {
                        if (distanceBetweenPoint(x1, y1, node.x, node.y) < minDistance) {
                            flag = false;
                        }
                    });
                    return flag;
                }

                var counterAddNode = 0;
                while (counterAddNode < inputData.colNodeInRegionNetwork) {
                    var tmpX = getRandomInt(leftBor, rightBor);
                    var tmpY = getRandomInt(bottomBorder, topBorder);
                    var iteration = 0;
                    //подбираем точки пока растояние не будет больше минимального
                    while (!checkDistance(tmpX, tmpY)) {
                        if (iteration > 100) {
                            console.log("it is not impossible get coordinates point with assigned min distance");
                            break;
                        }
                        tmpX = getRandomInt(leftBor, rightBor);
                        tmpY = getRandomInt(bottomBorder, topBorder);
                        iteration++;
                    }
                    addNode(tmpX, tmpY);
                    counterAddNode++;
                }
            };

            addLeftSection(leftBorder, lLimit);
            addLeftSection(rLimit, rightBorder);
        };
        graph.nodes = [];

        createTwoCenterPoint();
        /**
         * lLimit - правая граница для точек слева
         */
        createElsePoint(graph.nodes[0].x - minDistance, graph.nodes[1].x + minDistance);
        //console.log(getRandomInt(1, 2));
    }


    function createLink() {
        function addLink(source, target) {
            var link = {};
            var ranWeight
                = inputData.weights[getRandomInt(0, inputData.weights.length)];
            link.source = source;
            link.target = target;
            link.weight = ranWeight;
            link.isDuplex = getRandomInt(0, 2);
            link.absoluteWeight = (link.isDuplex == 1) ? link.weight*2 : link.weight;
            link.id = source + '-' + target;
            graph.links.push(link);
        }

        function addCentralLink() {
            addLink(0, 1);
        }

        function addElseLinks() {

            function isExistLink(source, target) {
                var flag = false;
                graph.links.map(function (elem) {
                    if (elem.source == source && elem.target == target ||
                        elem.target == source && elem.source == target) {
                        flag = true;
                    }
                })
                return flag
            };

            function colLinksByNumberNode(number) {
                var counter = 0;
                graph.links.map(function (elem) {
                    if (elem.source == number || elem.target == number) {
                        counter++;
                    }
                })
                return counter
            };

            function addSection(startIndexNode, endIndexNode) {
                for (var i = startIndexNode; i < endIndexNode; i++) {
                    var iteration = 0;
                    var colLinkSource = colLinksByNumberNode(i);
                    while (colLinkSource < inputData.minColLink) {
                        var source = i;
                        var target = getRandomInt(startIndexNode, endIndexNode);
                        if (!isExistLink(source, target)
                            && target != source
                            && colLinksByNumberNode(target) < inputData.minColLink) {
                            addLink(source, target);
                            colLinkSource = colLinksByNumberNode(i);
                        }
                        iteration++;
                        if (iteration > 100) {
                            console.log("it is not impossible ");
                            break;
                        }
                    }
                }
            }


            function addLinkLeftCenter() {
                var colLink = 1;
                while (colLink < inputData.minColLink) {
                    var source = 0;
                    var target = getRandomInt(1, inputData.colNodeInRegionNetwork);
                    if (!isExistLink(source, target)) {
                        addLink(source, target);
                        colLink++;
                    }
                }
            };
            function addLinkRightCenter() {
                var colLink = 1;
                while (colLink < inputData.minColLink) {
                    var source = 1;
                    var target = getRandomInt(colNodeInRegionNetwork + 2, graph.nodes.length);
                    addLink(source, target);
                    colLink++;
                }
            };


            // + 2 потому что две центральных
            addSection(2, inputData.colNodeInRegionNetwork + 2);
            addLinkLeftCenter();
            addSection(inputData.colNodeInRegionNetwork + 2, graph.nodes.length);
            addLinkRightCenter();


        }

        graph.links = [];
        addCentralLink();
        addElseLinks();
    }


    createNodes();
    createLink();
    return graph;
}

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


