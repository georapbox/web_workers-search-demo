/* global self: false */
self.addEventListener('connect', function (e) {
    'use strict';

    function contains(subjectString, searchString, position) {
        var subjectLength,
            searchLength;

        if (String.prototype.includes) {
            return subjectString.includes(searchString, position);
        }

        if (!searchString) {
            return false;
        }

        position = parseInt(position, 10) || 0;
        subjectLength = subjectString.length;
        searchLength = searchString.length;

        return position + searchLength <= subjectLength ?
            subjectString.indexOf(searchString, position) !== -1 :
            false;
    }

    var port = e.ports[0];

    var globalUsers;

    port.addEventListener('message', function (e) {
        var res = JSON.parse(e.data),
            data;

        if (res.users) {
            globalUsers = res.users;
        }

        data = globalUsers.filter(function (item) {
            return contains(item.firstname.toLowerCase() + ' ' + item.lastname.toLowerCase(), res.search.toLowerCase());
        });

        try {
            data = JSON.stringify(data);
            port.postMessage(data);
        } catch (err) {
            throw new Error(err);
        }
    });

    port.start();
});
