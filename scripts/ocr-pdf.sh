#!/usr/bin/env bash
#
# OCR any PDFs that live in a record's canonical directory, producing a
# co-located .txt with page markers. Idempotent — skips PDFs that already
# have a matching .txt next to them.
#
# Usage:
#   scripts/ocr-pdf.sh <record-dir> [<record-dir> ...]
#
# Example:
#   scripts/ocr-pdf.sh docs/us/utah/oaip/rma/2025-001/
#   scripts/ocr-pdf.sh docs/us/utah/oaip/rma/*/
#
# Requires: poppler (pdftoppm, pdfinfo) + tesseract. All available via brew.

set -euo pipefail

command -v pdftoppm >/dev/null || { echo "pdftoppm missing — brew install poppler" >&2; exit 1; }
command -v pdfinfo  >/dev/null || { echo "pdfinfo missing — brew install poppler"  >&2; exit 1; }
command -v tesseract >/dev/null || { echo "tesseract missing — brew install tesseract" >&2; exit 1; }

if [[ $# -eq 0 ]]; then
    echo "Usage: $0 <record-dir> [<record-dir> ...]" >&2
    exit 2
fi

DPI="${OCR_DPI:-300}"

ocr_one_pdf() {
    local pdf="$1"
    local dir base txt
    dir="$(dirname "$pdf")"
    base="$(basename "$pdf" .pdf)"
    txt="$dir/$base.txt"

    if [[ -s "$txt" ]]; then
        echo "  [skip] $txt already exists ($(wc -c <"$txt") bytes)"
        return 0
    fi

    local pages
    pages="$(pdfinfo "$pdf" | awk '/^Pages:/ {print $2}')"
    echo "  [ocr]  $pdf ($pages pages)"

    local tmpdir
    tmpdir="$(mktemp -d -t publedge-ocr)"
    trap "rm -rf \"$tmpdir\"" RETURN

    pdftoppm -r "$DPI" -png "$pdf" "$tmpdir/page" >/dev/null

    : > "$txt"
    local i=1
    for png in "$tmpdir"/page-*.png; do
        tesseract "$png" "${png%.png}" >/dev/null 2>&1 || true
        {
            echo "---- Page $i ----"
            echo
            cat "${png%.png}.txt"
            echo
        } >> "$txt"
        i=$((i + 1))
    done

    local lines bytes
    lines="$(wc -l <"$txt" | tr -d ' ')"
    bytes="$(wc -c <"$txt" | tr -d ' ')"
    echo "  [done] $txt ($lines lines, $bytes bytes)"
}

for dir in "$@"; do
    [[ -d "$dir" ]] || { echo "  [warn] $dir is not a directory — skipping" >&2; continue; }
    echo "Scanning $dir"
    shopt -s nullglob
    for pdf in "$dir"/*.pdf; do
        ocr_one_pdf "$pdf"
    done
    shopt -u nullglob
done

echo
echo "OCR complete. Add to each instrument frontmatter:"
echo "  source_documents:"
echo "    - <pdf-filename>"
echo "  extracted_text: <txt-filename>"
echo "Then re-run: node scripts/build.js"
