/* PubLedge — minimal client-side search.
   Reads assets/data.json and filters on input. No framework. */
(function () {
    'use strict';

    function findRoot(script) {
        var src = script.getAttribute('src') || '';
        return src.replace(/search\.js.*$/, '');
    }

    var currentScript = document.currentScript || (function () {
        var s = document.getElementsByTagName('script');
        return s[s.length - 1];
    })();
    var assetsBase = findRoot(currentScript);
    var siteBase = assetsBase.replace(/assets\/$/, '');

    var input = document.getElementById('siteSearchInput');
    var results = document.getElementById('searchResults');
    if (!input || !results) return;

    var data = null;
    var fetching = null;

    function fetchData() {
        if (data) return Promise.resolve(data);
        if (fetching) return fetching;
        fetching = fetch(assetsBase + 'data.json').then(function (r) { return r.json(); }).then(function (j) {
            data = j;
            return j;
        }).catch(function () {
            data = [];
            return [];
        });
        return fetching;
    }

    function render(matches) {
        if (!matches.length) { results.innerHTML = ''; return; }
        results.innerHTML = matches.slice(0, 20).map(function (m) {
            var href = m.href.indexOf('http') === 0 || m.href.indexOf('/') === 0 ? m.href : siteBase + m.href;
            return '<a href="' + href + '"><span class="search-type">' + (m.type || '') + '</span>' + escape(m.name) + '</a>';
        }).join('');
    }

    function escape(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function run(q) {
        if (!q || q.length < 2) { results.innerHTML = ''; return; }
        var ql = q.toLowerCase();
        var matches = data.filter(function (item) {
            return (item._search || item.name || '').toString().toLowerCase().indexOf(ql) !== -1;
        });
        render(matches);
    }

    input.addEventListener('focus', fetchData);
    input.addEventListener('input', function () {
        fetchData().then(function () { run(input.value.trim()); });
    });
    document.addEventListener('click', function (e) {
        if (!results.contains(e.target) && e.target !== input) results.innerHTML = '';
    });
})();
