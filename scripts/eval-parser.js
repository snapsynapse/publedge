#!/usr/bin/env node
'use strict';

const { parseYaml } = require('./lib/parse');
const { reportFailures } = require('./lib/eval-kit');

const failures = [];

function assertEqual(label, actual, expected) {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) failures.push(`${label}: expected ${e}, got ${a}`);
}

const parsed = parseYaml(`
"@type": "https://w3id.org/semanticarts/ns/ontology/gist/Contract"
issued_by:
  "@type": "https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment"
  name: "Utah Office of Artificial Intelligence Policy (OAIP)"
  ref: "https://commerce.utah.gov/ai/learning-lab/"
publication_citations:
  - "https://commerce.utah.gov/wp-content/uploads/2025/06/Dentacor-Mitigation-Agreement.pdf"
  - https://example.com/a:b/c
parties:
  - name: "Utah Office of Artificial Intelligence Policy"
    role: issuing_authority
inline_objects:
  - { "@type": "Thing", url: "https://example.com/a,b" }
`);

assertEqual('top-level quoted key', parsed['@type'], 'https://w3id.org/semanticarts/ns/ontology/gist/Contract');
assertEqual('nested quoted key', parsed.issued_by?.['@type'], 'https://w3id.org/semanticarts/ns/ontology/gist/SubCountryGovernment');
assertEqual('quoted URL list scalar', parsed.publication_citations?.[0], 'https://commerce.utah.gov/wp-content/uploads/2025/06/Dentacor-Mitigation-Agreement.pdf');
assertEqual('bare URL list scalar', parsed.publication_citations?.[1], 'https://example.com/a:b/c');
assertEqual('list object child field', parsed.parties?.[0]?.role, 'issuing_authority');
assertEqual('inline object quoted key', parsed.inline_objects?.[0]?.['@type'], 'Thing');
assertEqual('inline object URL with comma', parsed.inline_objects?.[0]?.url, 'https://example.com/a,b');

reportFailures('eval-parser', failures);
