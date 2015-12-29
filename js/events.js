/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */

addEventListener("DOMContentLoaded", function () {


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
            console.log(data);
            renderGraph(data);
        }).error(function () {
            console.log("error");
            notification.create("Ошибка", "error");
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
            title: 'Таблица маршрутизации для узла № ' + valInput
        }));
        $modalTable.modal('toggle');
    });


    /**
     * MENU UI
     */

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
            idNode:idNode,
            nodeName:nodeName,
            messageLength:messageLength
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
     * handlers for nodes parametrs in modal window
     */

    $body.on('click', '.js-table-shortest-way', function () {
        var $this = $(this),
            valInput = $this.closest('form').find('input[name="name-node"]').val(),
            nodeNumber = getNumberNodeByName(global.graph.nodes, valInput),
            shortestPathes = searchShortestPathes(nodeNumber, global.graph.nodes.length, global.graph.graphMatrix),
            $modalTable = $('.modal-table');

        $(this).closest('.modal').modal('hide');

        setTimeout(function(){ //задержка для того что прошлый попап успел скрыться
            $modalTable.empty().append(global.templates["js-template-table"]({
                data: shortestPathes,
                title: 'Таблица маршрутизации для узла № ' + valInput
            }));
            $modalTable.modal('toggle');
        },800);
    });

    $body.on('click', '.js-table-time', function () {
        var $this = $(this),
            nodeName = $this.closest('form').find('input[name="name-node"]').val(),
            nodeId = $this.closest('form').find('input[name="id-node"]').val(),
            messageLength = $this.closest('form').find('input[name="messageLength"]').val(),
            $modalTable = $('.js-modal-table-time');

        $(this).closest('.modal').modal('hide');
        var node = getNodeById(nodeId);


        var arrDetagram1050 = getTimeSendPackage(nodeId, 1050, messageLength, 0); //datagrams
        var arrDetagram2050 =  getTimeSendPackage(nodeId, 2050, messageLength, 0); //datagrams
        var arrDetagram3050 = getTimeSendPackage(nodeId, 3050, messageLength, 0); //datagrams
        var arrLogic1050 = getTimeSendPackage(nodeId, 1050, messageLength, 0); //logic
        var arrLogic2050 =  getTimeSendPackage(nodeId, 2050, messageLength, 0); //logic
        var arrLogic3050 = getTimeSendPackage(nodeId, 3050, messageLength, 0); //logic

        var length = arrDetagram1050.length;
        var tmpObj = {};
        for (var i = 0; i < length; i++) {
            tmpObj[i] = {};
            var tmp = tmpObj[i];
            tmp.nodeName = i;
            tmp.arrDetagram1050 = arrDetagram1050[i];
            tmp.arrDetagram2050 = arrDetagram2050[i];
            tmp.arrDetagram3050 = arrDetagram3050[i];
            tmp.arrLogic1050 = arrLogic1050[i];
            tmp.arrLogic2050 = arrLogic2050[i];
            tmp.arrLogic3050 = arrLogic3050[i];
        }

        setTimeout(function(){ //задержка для того что прошлый попап успел скрыться
            $modalTable.empty().append(global.templates["js-modal-table-time"]({
                data: tmpObj,
                nodeName: nodeName,
                messageLength:messageLength
            }));
            $modalTable.modal('toggle');
        },800);
    });
});
