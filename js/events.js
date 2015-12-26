/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 23.12.15
 */
addEventListener("DOMContentLoaded", function () {

    var $forms = $('.js-simple-form');


    $forms.on("submit", function (e) {
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
        });
    });

    $('.js-save').on('click', function () {
        saveGraphOnSever();
    });

    $('.js-remove-node').on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();


        var graph = global.graph,
            nameNode = $(this).closest('form').find('input').val(),
            numberNode = getNumberNodeByName(graph.nodes, nameNode);

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
        renderGraph(graph);
        saveGraphOnSever();
    });
});
