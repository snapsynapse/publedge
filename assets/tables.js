/**
 * PubLedge — Sortable & Filterable Tables
 * Adopted from EveryAILaw. Zero dependencies. Auto-initializes on DOMContentLoaded.
 * Targets all table.data-table elements; skips table.matrix-table.
 * Syncs filter/sort state with URL query parameters.
 */
(function () {
    'use strict';

    // passTheme is kept as a no-op so legacy onclick="passTheme(this)" attrs don't error.
    if (!window.passTheme) {
        window.passTheme = function () { return true; };
    }

    function initTables() {
        var tables = document.querySelectorAll('table.data-table');
        for (var i = 0; i < tables.length; i++) {
            initTable(tables[i]);
        }
    }

    function initTable(table) {
        var thead = table.querySelector('thead');
        var tbody = table.querySelector('tbody');
        if (!thead || !tbody) return;
        var rows = tbody.querySelectorAll('tr');
        if (rows.length === 0) return;
        for (var i = 0; i < rows.length; i++) {
            rows[i].setAttribute('data-original-index', i);
        }
        var ths = thead.querySelectorAll('th[data-sortable]');
        var filterSelects = [];
        var sortHandlers = {};
        for (var j = 0; j < ths.length; j++) {
            initHeader(ths[j], j, table, tbody, filterSelects, sortHandlers);
        }
        applyUrlState(table, ths, filterSelects, sortHandlers, tbody);
    }

    function initHeader(th, colIndex, table, tbody, filterSelects, sortHandlers) {
        var label = th.textContent.trim();
        var sortType = th.getAttribute('data-sort-type') || 'text';
        var colKey = th.getAttribute('data-col') || label.toLowerCase();
        var filterKey = th.getAttribute('data-filter-key');

        var content = document.createElement('div');
        content.className = 'th-content';
        var labelEl = document.createElement('span');
        labelEl.className = 'th-label';
        labelEl.textContent = label;
        var arrow = document.createElement('span');
        arrow.className = 'sort-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        labelEl.appendChild(arrow);
        content.appendChild(labelEl);

        var sortState = 0;
        th.setAttribute('aria-sort', 'none');

        function doSort(newState) {
            var allThs = table.querySelectorAll('thead th[data-sortable]');
            for (var k = 0; k < allThs.length; k++) {
                if (allThs[k] !== th) {
                    allThs[k].setAttribute('aria-sort', 'none');
                    allThs[k]._sortState = 0;
                }
            }
            sortState = newState;
            th._sortState = sortState;
            if (sortState === 0) {
                th.setAttribute('aria-sort', 'none');
                restoreOriginalOrder(tbody);
            } else if (sortState === 1) {
                th.setAttribute('aria-sort', 'ascending');
                sortColumn(tbody, colIndex, sortType, false);
            } else {
                th.setAttribute('aria-sort', 'descending');
                sortColumn(tbody, colIndex, sortType, true);
            }
        }

        labelEl.addEventListener('click', function (e) {
            e.stopPropagation();
            doSort((sortState + 1) % 3);
            updateUrl(table, filterSelects);
        });

        sortHandlers[colKey] = doSort;

        if (filterKey) {
            var tableRows = tbody.querySelectorAll('tr');
            if (tableRows.length >= 3) {
                var select = buildFilter(tableRows, colIndex, tbody, filterSelects, filterKey);
                if (select) {
                    content.appendChild(select);
                    filterSelects.push({ select: select, colIndex: colIndex, key: filterKey });
                }
            }
        }
        th.textContent = '';
        th.appendChild(content);
    }

    function buildFilter(rows, colIndex, tbody, filterSelects, filterKey) {
        var values = {};
        for (var i = 0; i < rows.length; i++) {
            var td = rows[i].children[colIndex];
            if (!td) continue;
            var sortVal = td.getAttribute('data-sort-value');
            var displayVal = td.textContent.trim();
            var val = (sortVal || displayVal).trim();
            if (val && val !== '—') {
                if (!values[val]) values[val] = displayVal || val.replace(/-/g, ' ');
            }
        }
        var keys = Object.keys(values).sort(function (a, b) {
            return (values[a] || a).localeCompare(values[b] || b);
        });
        if (keys.length < 2) return null;
        var select = document.createElement('select');
        select.className = 'th-filter';
        select.setAttribute('aria-label', 'Filter by ' + filterKey);
        var allOpt = document.createElement('option');
        allOpt.value = '';
        allOpt.textContent = 'All';
        select.appendChild(allOpt);
        for (var j = 0; j < keys.length; j++) {
            var opt = document.createElement('option');
            opt.value = keys[j];
            opt.textContent = values[keys[j]];
            select.appendChild(opt);
        }
        select.addEventListener('change', function () {
            applyFilters(tbody, filterSelects);
            updateUrl(select.closest('table'), filterSelects);
        });
        select.addEventListener('click', function (e) { e.stopPropagation(); });
        return select;
    }

    function applyFilters(tbody, filterSelects) {
        var rows = tbody.querySelectorAll('tr');
        var visibleCount = 0;
        for (var i = 0; i < rows.length; i++) {
            var show = true;
            for (var f = 0; f < filterSelects.length; f++) {
                var filterVal = filterSelects[f].select.value;
                if (!filterVal) continue;
                var td = rows[i].children[filterSelects[f].colIndex];
                if (!td) { show = false; break; }
                var cellVal = (td.getAttribute('data-sort-value') || td.textContent).trim();
                if (cellVal !== filterVal) { show = false; break; }
            }
            rows[i].style.display = show ? '' : 'none';
            if (show) visibleCount++;
        }
        var countEl = tbody.closest('table').parentElement.querySelector('.table-result-count');
        if (countEl) {
            countEl.innerHTML = '<strong>' + visibleCount + '</strong> of ' + rows.length;
            countEl.classList.toggle('filtered', visibleCount < rows.length);
        }
    }

    function updateUrl(table, filterSelects) {
        var params = new URLSearchParams(window.location.search);
        params.delete('sort');
        params.delete('dir');
        for (var f = 0; f < filterSelects.length; f++) params.delete(filterSelects[f].key);
        for (var g = 0; g < filterSelects.length; g++) {
            var val = filterSelects[g].select.value;
            if (val) params.set(filterSelects[g].key, val);
        }
        var sortedTh = table.querySelector('th[aria-sort="ascending"], th[aria-sort="descending"]');
        if (sortedTh) {
            var colKey = sortedTh.getAttribute('data-col') || '';
            var dir = sortedTh.getAttribute('aria-sort') === 'ascending' ? 'asc' : 'desc';
            params.set('sort', colKey);
            params.set('dir', dir);
        }
        var qs = params.toString();
        var newUrl = window.location.pathname + (qs ? '?' + qs : '');
        history.replaceState(null, '', newUrl);
    }

    function applyUrlState(table, ths, filterSelects, sortHandlers, tbody) {
        var params = new URLSearchParams(window.location.search);
        var hasFilter = false;
        for (var f = 0; f < filterSelects.length; f++) {
            var urlVal = params.get(filterSelects[f].key);
            if (urlVal) { filterSelects[f].select.value = urlVal; hasFilter = true; }
        }
        if (hasFilter) applyFilters(tbody, filterSelects);
        var sortCol = params.get('sort');
        var sortDir = params.get('dir');
        if (sortCol && sortHandlers[sortCol]) {
            var state = sortDir === 'desc' ? 2 : 1;
            sortHandlers[sortCol](state);
        }
    }

    function sortColumn(tbody, colIndex, sortType, descending) {
        var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        rows.sort(function (a, b) {
            var aVal = getSortValue(a.children[colIndex], sortType);
            var bVal = getSortValue(b.children[colIndex], sortType);
            var aEmpty = aVal === '' || aVal === null || aVal === undefined;
            var bEmpty = bVal === '' || bVal === null || bVal === undefined;
            if (aEmpty && bEmpty) return 0;
            if (aEmpty) return 1;
            if (bEmpty) return -1;
            var result;
            if (sortType === 'number') result = aVal - bVal;
            else result = String(aVal).localeCompare(String(bVal));
            return descending ? -result : result;
        });
        for (var i = 0; i < rows.length; i++) tbody.appendChild(rows[i]);
    }

    function getSortValue(td, type) {
        if (!td) return '';
        var raw = td.getAttribute('data-sort-value');
        if (raw !== null && raw !== '') {
            if (type === 'number') return parseFloat(raw) || 0;
            return raw.toLowerCase();
        }
        var text = td.textContent.trim();
        if (text === '—' || text === '') return '';
        if (type === 'number') return parseFloat(text) || 0;
        return text.toLowerCase();
    }

    function restoreOriginalOrder(tbody) {
        var rows = Array.prototype.slice.call(tbody.querySelectorAll('tr'));
        rows.sort(function (a, b) {
            return parseInt(a.getAttribute('data-original-index'), 10) -
                   parseInt(b.getAttribute('data-original-index'), 10);
        });
        for (var i = 0; i < rows.length; i++) tbody.appendChild(rows[i]);
    }

    // --- Keyboard shortcuts + mobile-nav/click-outside dismissal ---
    function initKeyboardAndDismiss() {
        var overlay = null;
        function isInput(el) {
            var tag = (el.tagName || '').toLowerCase();
            return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
        }
        function showHelp() {
            if (overlay) { hideHelp(); return; }
            overlay = document.createElement('div');
            overlay.className = 'keyboard-help-overlay';
            overlay.innerHTML = '<div class="keyboard-help">' +
                '<h3>Keyboard Shortcuts</h3>' +
                '<dl>' +
                '<dt><kbd>/</kbd></dt><dd>Focus search</dd>' +
                '<dt><kbd>?</kbd></dt><dd>Show/hide this help</dd>' +
                '<dt><kbd>j</kbd> / <kbd>k</kbd></dt><dd>Next / previous table row</dd>' +
                '<dt><kbd>Esc</kbd></dt><dd>Clear search, close overlay/menu</dd>' +
                '</dl>' +
                '<p style="margin-top:12px;font-size:0.75rem;color:var(--muted);">Press <kbd>?</kbd> or <kbd>Esc</kbd> to close</p>' +
                '</div>';
            overlay.addEventListener('click', function (e) { if (e.target === overlay) hideHelp(); });
            document.body.appendChild(overlay);
        }
        function hideHelp() { if (overlay) { overlay.remove(); overlay = null; } }
        function closeMobileMenu() {
            var menu = document.getElementById('siteNav');
            var btn = document.querySelector('.hamburger-btn');
            if (menu && menu.classList.contains('open')) {
                menu.classList.remove('open');
                if (btn) { btn.classList.remove('active'); btn.setAttribute('aria-expanded', 'false'); }
            }
        }

        document.addEventListener('keydown', function (e) {
            if (isInput(e.target) && e.key !== 'Escape') return;
            if (e.key === '/') {
                e.preventDefault();
                var search = document.getElementById('siteSearchInput');
                if (search) search.focus();
            } else if (e.key === '?') {
                e.preventDefault();
                showHelp();
            } else if (e.key === 'Escape') {
                hideHelp();
                closeMobileMenu();
                var search = document.getElementById('siteSearchInput');
                if (search && document.activeElement === search) {
                    search.value = '';
                    search.blur();
                    var results = document.getElementById('searchResults');
                    if (results) results.hidden = true;
                }
            } else if (e.key === 'j' || e.key === 'k') {
                var table = document.querySelector('.data-table tbody');
                if (!table) return;
                var rows = Array.prototype.slice.call(table.querySelectorAll('tr')).filter(function (r) {
                    return r.style.display !== 'none';
                });
                if (rows.length === 0) return;
                var current = table.querySelector('tr.row-focus');
                var idx = current ? rows.indexOf(current) : -1;
                if (current) current.classList.remove('row-focus');
                if (e.key === 'j') idx = Math.min(idx + 1, rows.length - 1);
                else idx = Math.max(idx - 1, 0);
                rows[idx].classList.add('row-focus');
                rows[idx].scrollIntoView({ block: 'nearest' });
            }
        });

        // Click-outside closes mobile nav + search results
        document.addEventListener('click', function (e) {
            var menu = document.getElementById('siteNav');
            var btn = document.querySelector('.hamburger-btn');
            if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !(btn && btn.contains(e.target))) {
                closeMobileMenu();
            }
            var results = document.getElementById('searchResults');
            var search = document.getElementById('siteSearchInput');
            if (results && !results.hidden && !results.contains(e.target) && e.target !== search) {
                results.hidden = true;
            }
        });
    }

    // --- Anchor-link copy buttons ---
    function initAnchors() {
        document.addEventListener('click', function (e) {
            var link = e.target.closest('.anchor-link');
            if (!link) return;
            e.preventDefault();
            var hash = link.getAttribute('href') || '#';
            var url = window.location.origin + window.location.pathname + hash;
            if (navigator.clipboard) navigator.clipboard.writeText(url).catch(function(){});
            var orig = link.textContent;
            link.textContent = '\u2713';
            setTimeout(function () { link.textContent = orig; }, 1200);
        });
        // Auto-expand <details> if URL hash targets it
        var hash = window.location.hash;
        if (hash) {
            var target = document.querySelector(hash);
            if (target && target.tagName === 'DETAILS') {
                target.setAttribute('open', '');
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    // Enhance deterministic absolute verification dates with a relative age.
    // The source HTML remains stable across builds; only the browser view ages.
    function initFreshnessBadges() {
        var badges = document.querySelectorAll('.freshness-badge[data-last-verified]');
        var now = new Date();
        for (var i = 0; i < badges.length; i++) {
            var badge = badges[i];
            var value = badge.getAttribute('data-last-verified');
            var verified = new Date(value + 'T00:00:00Z');
            if (isNaN(verified.getTime())) continue;
            var days = Math.max(0, Math.floor((now.getTime() - verified.getTime()) / 86400000));
            var state = days < 90 ? 'fresh' : days < 180 ? 'aging' : 'stale';
            badge.classList.add(state);
            badge.textContent = state === 'fresh' ? 'verified ' + days + 'd ago' : state + ' (' + days + 'd)';
        }
    }

    function initAll() {
        initTables();
        initKeyboardAndDismiss();
        initAnchors();
        initFreshnessBadges();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAll);
    } else {
        initAll();
    }
})();
