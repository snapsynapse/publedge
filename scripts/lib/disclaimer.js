'use strict';

/**
 * Composed disclaimer renderer — frontmatter spec v0.2.
 *
 * Spec: _workshop/CONTENT-GUIDE.md §"Disclaimer composition".
 *
 * Renderer keys off `source` + legal `status`. Editorial maturity is
 * intentionally orthogonal. Per-file `disclaimer:` overrides
 * are appended to (not substituted for) the composed text, and are reserved
 * for authority-specific reliance language that must be preserved verbatim
 * (e.g. an SEC no-action letter's exact staff caveat).
 *
 * `authoritative-reference` is a PubLedge extension for statute records and
 * receives a public-source notice.
 */

const INACTIVE = new Set(['superseded', 'withdrawn', 'expired']);

function composeDisclaimer(source, status, override) {
    const src = String(source || '').trim();
    const st = String(status || '').trim();
    const ovr = typeof override === 'string' ? override.trim() : '';

    let composed = '';

    if (src === 'authority-issued') {
        if (INACTIVE.has(st)) {
            composed = 'This instrument is no longer in effect. See superseded_by or withdrawn_date.';
        }
    } else if (src === 'demonstration-remap') {
        composed = 'Demonstration remap of a publicly archived authority artifact. Not an authority-issued PubLedge instrument. The official source controls.';
    } else if (src === 'publedge-original-draft') {
        if (st && st !== 'proposed') {
            return {
                composed: '',
                override: ovr,
                text: ovr,
                error: `publedge-original-draft must have legal status 'proposed', not '${st}'.`
            };
        }
        composed = 'Suggested prior art. Not authority-issued output. Awaiting lawyer review and authority sign-off before promotion.';
    } else if (src === 'authoritative-reference') {
        composed = 'Public statute, regulation, or rule reference. The official source controls. PubLedge does not issue authoritative interpretations of public law.';
    }

    const text = [composed, ovr].filter(Boolean).join(' ');
    return { composed, override: ovr, text, error: null };
}

module.exports = { composeDisclaimer };
