# Retained admission sources

Store exact retained primary source bytes under this directory using a new path for each document version. A UTF-8 review snapshot may accompany the original bytes; the admission receipt binds both.

Do not invent retrieval or transport history. Use `retained_snapshot` when only retained bytes and their actual source identity are known. Use `primary_retrieval` only when exact successful HTTP metadata and original bytes were retained at retrieval time.

## Receipt succession

Accepted receipts in `data/admission/receipts.json` are immutable. To change a record that already has a receipt, prepare a successor with `node scripts/prepare-source-admission.js --file PATH --supersede`. The successor embeds the earlier receipt verbatim under `supersedes.receipt`, binds to the record state that receipt admitted, reviews only the units changed since, and carries forward every earlier unresolved item. Unchanged units, including a human-renewed `last_verified`, stay under the earlier review; an agent successor still cannot renew Verified. `check:admission` against a base commit fails if an accepted receipt was rewritten instead of superseded.
