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



