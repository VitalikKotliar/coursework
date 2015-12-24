/**
 * User: Vitalik Kotliar
 * Email: 7vetaly7@ukr.net
 * Date: 24.12.15
 */

/*
 передаем массив нодов
 */
var nodesArray = [
    {
        "name": "1",
        "group": 1,
        "fixed": true,
        "x": 30,
        "y": 100
    },
    {
        "name": "2",
        "group": 1,
        "fixed": true,
        "x": 30,
        "y": 200
    },
    {
        "name": "3",
        "group": 1,
        "fixed": true,
        "x": 30,
        "y": 300
    },
    {
        "name": "4",
        "group": 1,
        "fixed": true,
        "x": 30,
        "y": 400
    },
    {
        "name": 4,
        "group": 1,
        "fixed": true,
        "x": 60,
        "y": 60
    },
    {
        "name": 5,
        "group": 1,
        "fixed": true,
        "x": 60,
        "y": 60
    },
    {
        "name": 6,
        "group": 1,
        "fixed": true,
        "x": 60,
        "y": 60
    },
    {
        "name": 7,
        "group": 1,
        "fixed": true,
        "x": 60,
        "y": 60
    },
    {
        "name": 8,
        "group": 1,
        "fixed": true,
        "x": 60,
        "y": 60
    },
    {
        "name": 9,
        "group": 1,
        "fixed": true,
        "x": 60,
        "y": 60
    },
    {
        "name": 10,
        "group": 1,
        "fixed": true,
        "x": 60,
        "y": 60
    },
    {
        "name": 11,
        "group": 1,
        "fixed": true,
        "x": 60,
        "y": 60
    },
    {
        "name": 12,
        "group": 1,
        "fixed": true,
        "x": 60,
        "y": 60
    }
];

global.getNumberNodeById = function (json, id) {
    var length = json.length;
    var result = -1;
    for (var i = 0; i < length; i++) {
        if (json[i].name == id)
            result = i;
    };
    return result;
};