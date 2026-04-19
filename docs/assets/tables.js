/* PubLedge — minimal table + theme helpers.
   - passTheme(): preserves ?theme= query when navigating (KaC convention).
   - Adds simple click-to-sort on tables marked with data-sortable. */
(function () {
    'use strict';

    window.passTheme = function (el) {
        try {
            var t = new URLSearchParams(window.location.search).get('theme');
            if (!t) return true;
            var href = el.getAttribute('href');
            if (!href || href.indexOf('#') === 0 || /^https?:/.test(href)) return true;
            var sep = href.indexOf('?') === -1 ? '?' : '&';
            el.setAttribute('href', href + sep + 'theme=' + encodeURIComponent(t));
        } catch (e) { /* no-op */ }
        return true;
    };

    // Apply theme from query string on load.
    try {
        var t = new URLSearchParams(window.location.search).get('theme');
        if (t === 'light') document.documentElement.classList.add('light-mode');
        if (t === 'dark') document.documentElement.classList.remove('light-mode');
    } catch (e) { /* no-op */ }

    // Theme toggle button (if present).
    document.addEventListener('click', function (e) {
        if (!e.target.matches || !e.target.matches('.theme-toggle')) return;
        document.documentElement.classList.toggle('light-mode');
        try { localStorage.setItem('publedge-theme', document.documentElement.classList.contains('light-mode') ? 'light' : 'dark'); } catch (_) {}
    });
    try {
        var stored = localStorage.getItem('publedge-theme');
        if (stored === 'light') document.documentElement.classList.add('light-mode');
    } catch (_) {}

    // Minimal sortable-table support.
    document.querySelectorAll('table[data-sortable] th').forEach(function (th, i) {
        th.style.cursor = 'pointer';
        th.addEventListener('click', function () {
            var table = th.closest('table');
            var tbody = table.tBodies[0];
            if (!tbody) return;
            var rows = Array.from(tbody.rows);
            var asc = th.getAttribute('data-sort-dir') !== 'asc';
            rows.sort(function (a, b) {
                var x = (a.cells[i] && a.cells[i].innerText.trim()) || '';
                var y = (b.cells[i] && b.cells[i].innerText.trim()) || '';
                var nx = parseFloat(x), ny = parseFloat(y);
                if (!isNaN(nx) && !isNaN(ny)) return asc ? nx - ny : ny - nx;
                return asc ? x.localeCompare(y) : y.localeCompare(x);
            });
            rows.forEach(function (r) { tbody.appendChild(r); });
            table.querySelectorAll('th').forEach(function (o) { o.removeAttribute('data-sort-dir'); });
            th.setAttribute('data-sort-dir', asc ? 'asc' : 'desc');
        });
    });
})();
