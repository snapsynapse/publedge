/* PubLedge — shared theme + banner injector for hand-crafted pages.
   Generated pages use the inline scripts emitted by build.js; this file
   gives static pages (templates, protocol, reference docs) the same
   theme-toggle behavior and site-wide disclaimer banner. Load early in
   <head> so the theme class is applied before first paint. */
(function () {
    'use strict';

    function applyStoredTheme() {
        try {
            var params = new URLSearchParams(window.location.search);
            var urlTheme = params.get('theme');
            var theme = urlTheme || localStorage.getItem('theme');
            if (theme === 'light') {
                document.documentElement.classList.add('light-mode');
                localStorage.setItem('theme', 'light');
            } else if (theme === 'dark') {
                document.documentElement.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            }
            if (urlTheme) {
                params.delete('theme');
                var q = params.toString();
                var newUrl = window.location.pathname + (q ? '?' + q : '') + window.location.hash;
                window.history.replaceState(null, '', newUrl);
            }
        } catch (e) { /* no-op */ }
    }

    window.toggleTheme = function () {
        var html = document.documentElement;
        var currentlyLight =
            html.classList.contains('light-mode') ||
            (!html.classList.contains('dark-mode') &&
             !window.matchMedia('(prefers-color-scheme: dark)').matches);
        html.classList.remove('light-mode', 'dark-mode');
        if (currentlyLight) {
            html.classList.add('dark-mode');
            try { localStorage.setItem('theme', 'dark'); } catch (_) {}
        } else {
            html.classList.add('light-mode');
            try { localStorage.setItem('theme', 'light'); } catch (_) {}
        }
    };

    function injectBanner() {
        if (document.querySelector('.site-banner')) return;
        var header = document.querySelector('header.site-header, header');
        if (!header) return;
        var b = document.createElement('aside');
        b.className = 'site-banner';
        b.setAttribute('aria-label', 'Site disclaimer');
        b.innerHTML = '<strong>Reference project in development.</strong> This registry is not authoritative and is not legal advice. Status values describe each instrument\u2019s own legal state, not editorial endorsement \u2014 see <a href="/definitions/">Definitions</a>.';
        if (header.nextSibling) {
            header.parentNode.insertBefore(b, header.nextSibling);
        } else {
            header.parentNode.appendChild(b);
        }
    }

    applyStoredTheme();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectBanner);
    } else {
        injectBanner();
    }
})();
