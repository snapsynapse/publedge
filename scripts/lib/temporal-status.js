'use strict';

const ACTIVE_STATUSES = new Set(['enforcing', 'phased-enforcement']);

function isIsoDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isBlank(value) {
    return value === undefined || value === null || /^(null|n\/a|tbd|)$/i.test(String(value).trim());
}

function temporalStatusFailures(record, today) {
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

    return failures;
}

module.exports = { isIsoDate, temporalStatusFailures };
