# Retained admission sources

Store exact retained primary source bytes under this directory using a new path for each document version. A UTF-8 review snapshot may accompany the original bytes; the admission receipt binds both.

Do not invent retrieval or transport history. Use `retained_snapshot` when only retained bytes and their actual source identity are known. Use `primary_retrieval` only when exact successful HTTP metadata and original bytes were retained at retrieval time.
