'use strict';

// This is a bounded maintenance pilot, not a new jurisdiction ingestion queue.
module.exports = [
    { id: 'utah-oaip-doctronic-rma', recordId: 'us-ut-oaip-rma-2025-002',
        url: 'https://commerce.utah.gov/ai/agreements/doctronic/', expectedHost: 'commerce.utah.gov', identity: ['doctronic', 'agreement'],
        qualification: 'Authority page for the existing Doctronic demonstration. The page does not itself renew the signed term or establish compliance.' },
    { id: 'utah-oaip-legion-rma', recordId: 'us-ut-oaip-rma-2026-001',
        url: 'https://commerce.utah.gov/ai/agreements/ai-legion-health/', expectedHost: 'commerce.utah.gov', identity: ['legion', 'agreement'],
        qualification: 'Authority page for the existing Legion demonstration. Commencement requires explicit evidence; absence of a notice is not a status finding.' },
    { id: 'utah-code-title-13-chapter-72', recordId: 'us-ut-legislature-statute-2024-sb149',
        relatedRecordIds: ['us-ut-legislature-statute-2025-sb332', 'us-ut-legislature-statute-2026-hb320'],
        url: 'https://le.utah.gov/xcode/Title13/Chapter72/13-72.html', expectedHost: 'le.utah.gov', identity: ['artificial intelligence', '13-72'],
        qualification: 'Current-code snapshot for context only. Statutory interpretation and updates belong to EveryAILaw; the chapter is not proof of every historical bill or PubLedge mapping.',
        sharedEvidence: { owner: 'every-ai-law', record: 'data/instruments/utah-sb149.md', url: 'https://everyailaw.com/regulation/utah-sb149/' } }
];
