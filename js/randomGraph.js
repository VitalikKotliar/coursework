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
        padding = getWidthInProcent(15), //отступ от краев 15 проценво
        topBorder = padding,
        bottomBorder = global.height - padding,
        leftBorder = padding,
        rightBorder = global.svgWidth - padding,
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
            var centerX = global.svgWidth / 2,
                centerY = global.height / 2,
                procentWidth = global.svgWidth / 100 * 5;
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
