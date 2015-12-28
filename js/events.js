/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */

function initClickNode() {
    var nodeCircle = d3.selectAll('.node');
    nodeCircle.on('click', function () {
        saveGraphOnSever();
    })
};

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

    $('body').on('click','.cancel', function () {
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

});
