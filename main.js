/* global users: false */
(function (win, doc, undefined) {
    'use strict';

    var myWorker = new SharedWorker('shared-worker.js'),
        searchInput = doc.getElementById('search_input'),
        clearButton = doc.getElementById('clear_button'),
        searchResultsList = doc.getElementById('search_results'),
        searchResultsCount = doc.getElementById('search_count'),
        agendaSent = false;

    myWorker.port.start();

    function debounce(callback, n, immediate) {
        var timeout;
        return function () {
            var context = this,
                args = arguments;

            var later = function () {
                timeout = null;
                if (!immediate) {
                    callback.apply(context, args);
                }
            };

            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, n);

            if (callNow) {
                callback.apply(context, args);
            }
        };
    }

    var sendData = debounce(function () {
        var data;

        if (this.value.length > 3) {
            if (agendaSent === false) {
                data = {
                    search: searchInput.value,
                    users: users
                };
            } else {
                data = {
                    search: searchInput.value
                };
            }

            console.time('send_data');
            try {
                data = JSON.stringify(data);
                myWorker.port.postMessage(data);
            } catch (err) {
                throw new Error(err);
            }
            console.timeEnd('send_data');

            agendaSent = true;
        } else {
            searchResultsList.innerHTML = '';
            searchResultsCount.innerHTML = '0';
        }
    }, 250);

    var clearInput = function () {
        searchInput.value = '';
        searchInput.focus();
        searchResultsList.innerHTML = '';
        searchResultsCount.innerHTML = '0';
    };

    searchInput.addEventListener('input', sendData, false);
    clearButton.addEventListener('click', clearInput, false);

    myWorker.port.addEventListener('message', function (e) {
        searchResultsList.innerHTML = '';

        var template = '',
            parsed = JSON.parse(e.data);

        Array.from(parsed, function (item) {
            template += '<li class="search-results-item">' + item.firstname + ' ' + item.lastname + '<br><span class="pale text-small">' + item.workemail + '</span></li>';
        });

        searchResultsList.innerHTML = template;
        searchResultsCount.innerHTML = parsed.length;

        console.log('Message received from worker');
    });
}(window, document));
