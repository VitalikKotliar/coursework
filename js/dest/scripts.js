/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */
addEventListener("DOMContentLoaded", function () {

    var forms = document.getElementsByTagName('form');

    Array.prototype.map.call(forms, function (form) {


        form.addEventListener("submit", function (e) {
            var $this = $(this);
            console.log("in submint");
            console.log($this);
            var data = $this.serialize();
            console.log(data);
            $.ajax({
                url: form.action,
                method: form.method,
                data: data
            }).done(function (data) {
                console.log("in done");
                console.log(data);
                renderGraph(data);
            }).error(function () {
                console.log("error");
            });
            e.preventDefault();
        });

    });
});

/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */

function getCenterLine(x1, x2) {
    return Math.round((x1 + x2) / 2);
}

function getGraphJson() {
    var json = {};
    $.ajax({
        url: '/graph',
        method: 'GET',
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
/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 22.05.2015
 */

var global = {
    setting: {
        radiusNode: 15
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

    var graph = jsonGraph || getGraphJson();
    console.log("in render = ",graph);
    global.force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();

    //create links
    //логично сначала прорисовать ноды потом линки,
    // но ноды дожны быть выше в дом дереве что бы они показывались выше ликов
    var linksWrapper = global.svg.selectAll(".link")
        .data(graph.links)
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
        .data(graph.nodes)
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

addEventListener("DOMContentLoaded", function () {
    initWindow();
    renderGraph();
});