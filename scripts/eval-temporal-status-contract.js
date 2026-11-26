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

const unresolvedBlock = {
    since: '2026-06-30',
    last_evidenced_status: 'enforcing',
    question: 'Did the authority extend, renew, or end the term after 2026-06-30?',
    last_checked: '2026-07-01',
    evidence: ['ops/evidence/example.md']
};
const withBlock = changes => ({ ...unresolvedBlock, ...changes });

expectPass('unresolved-after-term', {
    status: 'unresolved',
    term_start: '2025-06-30',
    term_end: '2026-06-30',
    status_unresolved: unresolvedBlock
});
expectFailure('unresolved-without-block', {
    status: 'unresolved'
}, 'without a status_unresolved block');
expectFailure('block-without-unresolved-status', {
    status: 'enforcing',
    status_unresolved: unresolvedBlock
}, 'has status_unresolved but status is enforcing');
expectFailure('unresolved-without-evidence', {
    status: 'unresolved',
    status_unresolved: withBlock({ evidence: [] })
}, 'without retained evidence');
expectFailure('unresolved-without-question', {
    status: 'unresolved',
    status_unresolved: withBlock({ question: '' })
}, 'without a stated open question');
expectFailure('unresolved-self-referential', {
    status: 'unresolved',
    status_unresolved: withBlock({ last_evidenced_status: 'unresolved' })
}, 'without a last evidenced status');
expectFailure('unresolved-from-future', {
    status: 'unresolved',
    status_unresolved: withBlock({ since: '2026-08-01', last_checked: '2026-08-01' })
}, 'unresolved from a future date');
expectFailure('unresolved-checked-before-conflict', {
    status: 'unresolved',
    status_unresolved: withBlock({ last_checked: '2026-06-01' })
}, 'before it became unresolved');
expectFailure('unresolved-not-rechecked', {
    status: 'unresolved',
    status_unresolved: withBlock({ since: '2026-01-01', last_checked: '2026-04-01' })
}, 'has not been rechecked against sources');
{
    const found = temporalStatusFailures({ id: 'unresolved-missing-evidence-file', status: 'unresolved', status_unresolved: unresolvedBlock },
        TODAY, { exists: () => false });
    if (!found.some(message => message.includes('cites missing unresolved-status evidence'))) {
        failures.push(`unresolved-missing-evidence-file did not report missing evidence; got: ${found.join('; ') || 'no failures'}`);
    }
}

reportFailures('eval-temporal-status-contract', failures);
