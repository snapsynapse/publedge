#!/usr/bin/env node
'use strict';

const { temporalStatusFailures } = require('./lib/temporal-status');
const { reportFailures } = require('./lib/eval-kit');

const TODAY = '2026-07-25';
const failures = [];

function expectPass(label, record) {
    const found = temporalStatusFailures({ id: label, ...record }, TODAY);
    if (found.length > 0) failures.push(`${label} unexpectedly failed: ${found.join('; ')}`);
}

function expectFailure(label, record, needle) {
    const found = temporalStatusFailures({ id: label, ...record }, TODAY);
    if (!found.some(message => message.includes(needle))) {
        failures.push(`${label} did not report "${needle}"; got: ${found.join('; ') || 'no failures'}`);
    }
}

expectPass('active-current', {
    status: 'enforcing',
    effective: '2026-01-01',
    term_start: '2026-01-01',
    term_end: '2026-12-31'
});
expectPass('deferred-commencement', {
    status: 'enacted',
    effective: null,
    commencement_date_trigger: 'Participant notice'
});
expectPass('expired-after-term', {
    status: 'expired',
    term_start: '2025-01-01',
    term_end: '2026-01-01'
});
expectPass('superseded-with-successor', {
    status: 'superseded',
    superseded_by: 'successor-record'
});

expectFailure('future-active', {
    status: 'enforcing',
    effective: '2027-01-01'
}, 'before its effective date');
expectFailure('elapsed-active', {
    status: 'enforcing',
    effective: '2025-01-01',
    term_end: '2026-01-01'
}, 'after its term ended');
expectFailure('stale-enacted', {
    status: 'enacted',
    effective: '2026-01-01'
}, 'remains enacted after its effective date');
expectFailure('untriggered-enacted', {
    status: 'enacted',
    effective: null
}, 'without an effective date or commencement trigger');
expectFailure('reversed-term', {
    status: 'enforcing',
    term_start: '2026-12-31',
    term_end: '2026-01-01'
}, 'before term_start');
expectFailure('undated-expiration', {
    status: 'expired',
    term_end: null
}, 'without a dated term_end');
expectFailure('premature-expiration', {
    status: 'expired',
    term_end: '2026-12-31'
}, 'before its term ended');
expectFailure('unlinked-supersession', {
    status: 'superseded',
    superseded_by: null
}, 'without superseded_by');
expectFailure('misstated-successor-link', {
    status: 'enforcing',
    superseded_by: 'successor-record'
}, 'has superseded_by but status is enforcing');

reportFailures('eval-temporal-status-contract', failures);
