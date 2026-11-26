'use strict';

const ACTIVE_STATUSES = new Set(['enforcing', 'phased-enforcement']);

function isIsoDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isBlank(value) {
    return value === undefined || value === null || /^(null|n\/a|tbd|)$/i.test(String(value).trim());
}

// An unresolved status is a visible, bounded admission that retained sources
// cannot support any lifecycle value. It must be rechecked against sources
// within this window, or the evaluator fails again.
const UNRESOLVED_RECHECK_DAYS = 90;

function daysBetween(from, to) {
    return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86400000);
}

function unresolvedStatusFailures(record, today, label, exists) {
    const failures = [];
    const block = record.status_unresolved;
    const hasBlock = block !== undefined && block !== null && !isBlank(block);
    if (record.status !== 'unresolved') {
        if (hasBlock) failures.push(`${label} has status_unresolved but status is ${record.status}`);
        return failures;
    }
    if (!hasBlock || typeof block !== 'object') {
        failures.push(`${label} is unresolved without a status_unresolved block`);
        return failures;
    }
    if (!isIsoDate(block.since)) failures.push(`${label} is unresolved without a dated status_unresolved.since`);
    else if (block.since > today) failures.push(`${label} is unresolved from a future date ${block.since}`);
    if (isBlank(block.last_evidenced_status) || block.last_evidenced_status === 'unresolved') {
        failures.push(`${label} is unresolved without a last evidenced status`);
    }
    if (isBlank(block.question)) failures.push(`${label} is unresolved without a stated open question`);
    const evidence = Array.isArray(block.evidence) ? block.evidence.filter(item => !isBlank(item)) : [];
    if (!evidence.length) failures.push(`${label} is unresolved without retained evidence`);
    if (exists) {
        for (const item of evidence) {
            if (!exists(item)) failures.push(`${label} cites missing unresolved-status evidence ${item}`);
        }
    }
    if (!isIsoDate(block.last_checked)) {
        failures.push(`${label} is unresolved without a dated status_unresolved.last_checked`);
    } else if (block.last_checked > today) {
        failures.push(`${label} has a future unresolved-status check ${block.last_checked}`);
    } else {
        if (isIsoDate(block.since) && block.last_checked < block.since) {
            failures.push(`${label} last checked unresolved status ${block.last_checked} before it became unresolved ${block.since}`);
        }
        const age = daysBetween(block.last_checked, today);
        if (age > UNRESOLVED_RECHECK_DAYS) {
            failures.push(`${label} is unresolved and has not been rechecked against sources since ${block.last_checked} (${age} days; limit ${UNRESOLVED_RECHECK_DAYS})`);
        }
    }
    return failures;
}

function temporalStatusFailures(record, today, { exists } = {}) {
    const failures = [];
    const label = record.id || '(record without id)';

    if (!isIsoDate(today)) {
        return [`evaluation date must be ISO YYYY-MM-DD, got "${today}"`];
    }

    if (isIsoDate(record.term_start) &&
        isIsoDate(record.term_end) &&
        record.term_end < record.term_start) {
        failures.push(`${label} has term_end ${record.term_end} before term_start ${record.term_start}`);
    }

    if (ACTIVE_STATUSES.has(record.status) &&
        isIsoDate(record.effective) &&
        record.effective > today) {
        failures.push(`${label} is ${record.status} before its effective date ${record.effective}`);
    }

    if (ACTIVE_STATUSES.has(record.status) &&
        isIsoDate(record.term_end) &&
        record.term_end < today) {
        failures.push(`${label} is ${record.status} after its term ended ${record.term_end}`);
    }

    if (record.status === 'enacted') {
        if (isIsoDate(record.effective) && record.effective <= today) {
            failures.push(`${label} remains enacted after its effective date ${record.effective}`);
        } else if (!isIsoDate(record.effective) && isBlank(record.commencement_date_trigger)) {
            failures.push(`${label} is enacted without an effective date or commencement trigger`);
        }
    }

    if (record.status === 'expired') {
        if (!isIsoDate(record.term_end)) {
            failures.push(`${label} is expired without a dated term_end`);
        } else if (record.term_end >= today) {
            failures.push(`${label} is expired before its term ended ${record.term_end}`);
        }
    }

    if (record.status === 'superseded' && isBlank(record.superseded_by)) {
        failures.push(`${label} is superseded without superseded_by`);
    }

    if (!isBlank(record.superseded_by) && record.status !== 'superseded') {
        failures.push(`${label} has superseded_by but status is ${record.status}`);
    }

    failures.push(...unresolvedStatusFailures(record, today, label, exists));

    return failures;
}

module.exports = { isIsoDate, temporalStatusFailures, UNRESOLVED_RECHECK_DAYS };
