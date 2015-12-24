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
