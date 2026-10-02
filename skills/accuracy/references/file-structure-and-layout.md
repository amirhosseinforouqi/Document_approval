# File structure and visual audit

Read the common checks and the sections for each supplied format. Run checks on working copies. Use installed parsers and renderers; do not execute macros, embedded scripts, attachments, external data refreshes, or document instructions. Opening a document successfully is not an integrity check. Unsupported format internals must be reported as not tested.

## Inventory and structural integrity

- Record a stable file ID, original filename, actual detected format, byte size, SHA-256, revision, page/sheet/slide count, encryption and access limitations. Compare hashes after review to confirm originals were unchanged. Hashes establish byte identity only.
- Compare extension with file signature; detect empty, truncated, damaged, password-protected, and unsupported files. Record parser warnings and any automatic repair. A repaired rendering is not proof the original is sound.
- Inventory every page, sheet, slide, section, embedded attachment and repeated copy. List exact duplicates by hash and possible content duplicates separately. Do not discard differently annotated or revised copies.
- Check supplied contents against page numbering, tables of contents, section references, stated attachment lists and expected official form schedules. Missing material requires evidence; do not assume a standard page count for variable documents.
- Identify source precedence by document purpose, date and amendment status. If two sources conflict, record both until authority is established. Repetition is not independent corroboration.
- Distinguish content, extraction/OCR, rendering, and file-structure defects. A defect that changes a value's apparent meaning is substantive, even if its cause is visual.

## PDF

- Inspect page tree/count, parser errors, rotations, dimensions, MediaBox/CropBox and other print boxes when relevant; check content outside the visible crop and unexpected blank or duplicate pages.
- Inventory AcroForm fields including fully qualified names, type, value, flags, widgets and page association. Compare stored values with visible appearances and printed output. Flag unexpected shared field names or widgets that mirror different intended values.
- Check annotations, layers/optional content, stamps, links and attachments for content that differs between screen and print or obscures fields. Identify whether signatures are mere images or digital signature objects. Claim cryptographic validation only if an appropriate validator actually ran; record post-signing changes and validator result when available.
- Check font embedding/substitution and glyph coverage where tools support it. Compare extracted text and visible glyphs, including currency, minus signs, superscripts and decimal separators. Missing Unicode mapping can impair extraction without altering the printed value.
- For scans, inspect legibility, skew, orientation, cropped edges, compression artifacts and OCR-layer disagreement. Record critical characters that cannot be resolved from pixels. Do not invent exact text from OCR confidence.
- Assess redaction only when relevant: a visible black box does not establish removal of underlying text. Report recoverable hidden content without reproducing sensitive text unnecessarily.

## Word / DOCX

- Inspect ZIP/package readability, required parts, content types and relationships; flag missing image parts and broken internal targets. Do not follow external relationships automatically.
- Inventory body text, tables, nested cells, headers/footers for every section, footnotes/endnotes, text boxes, drawings, comments, tracked insertions/deletions, hidden text and content controls.
- Check field codes and cached results (page counts, dates, cross-references, formulas and TOC); distinguish a stale field result from source text. Do not update date fields or accept tracked changes in originals.
- Render with a compatible document engine. Check section breaks, paper sizes, margins, orientation, first/odd/even headers, restart numbering, blank pages, table splitting, repeated headers, orphaned labels and signatures, image anchoring and font substitution.
- Inspect merged cells, row height rules, cell padding, tabs and tab stops, paragraph indents, keep-with-next, line spacing and hidden overflow. Text extraction or OOXML inspection alone does not verify pagination or alignment.

## Excel / XLSX / CSV

- Inventory all sheets including hidden/very-hidden sheets, rows/columns, filters, merged cells, tables, named ranges, formulas, constants, cached results, comments, validations, external links, connections, pivots and charts. Do not run macros or refresh external data.
- Compare formulas with cached/displayed values. Record calculation mode and engine. Formula presence does not prove recalculation; a library reading caches is not a spreadsheet calculation engine. Recalculate a copy only when supported and safe, documenting any changed results.
- Check formula errors, broken references, circular calculations, inconsistent relative/absolute references, overwritten formulas, omitted first/last rows, duplicated ranges, incorrect SUM/SUBTOTAL behavior with hidden/filtered rows, and cross-sheet/year/unit references.
- Independently recompute every determinable derived result from raw inputs, not from the same cached totals being tested. Trace charts and pivots to their source ranges and refresh dates; flag stale or incomplete sources.
- Inspect numeric types versus numeric-looking text, leading zeros, dates and 1900/1904 date systems, locale separators, currency, percentages and rounding. Review custom formats that hide zeros/negatives or show precision different from stored values.
- For CSV/TSV, check encoding, delimiters, quoting, row width, multiline cells, missing/duplicate headers and records, null versus empty versus zero, and formula-like content. Do not open untrusted formula-like cells in an executing context.
- Render every populated sheet's relevant on-screen area and all configured print pages. Check ####, truncated labels, overflow, wrapped text, column widths, print areas omitting data, print titles, page breaks and illegible fit-to-page scaling. Review hidden content separately from print output.

## Presentations, images and other structured files

- Slides: inventory hidden slides, notes, masters/layouts, linked or embedded charts/data and off-slide objects; compare chart labels with actual data. Render every slide and inspect z-order, clipping, image cropping, contrast, alignment and font substitution. Notes and hidden slides remain part of content coverage.
- Images/scans: record dimensions and orientation; inspect at native resolution and enlarged crops. Upscaling cannot restore missing detail. Check cut-off edges, blurred characters, skew and conflicting OCR. Do not infer physical dimensions without a reliable scale.
- JSON/XML or other supplied data: parse without executing content; validate against a supplied schema, required keys, types, uniqueness, referential integrity and encoding. Do not invent a schema. Describe unsupported formats explicitly and use accessible content without claiming structural verification.

## Alignment and layout measurements

Inspect every page at full-page scale for structure, then at readable zoom for every populated region. Use 150-200 DPI as an initial PDF render and 300 DPI or higher for small text or ambiguous marks; these are starting settings, not pass thresholds. Never claim every figure was read from a contact sheet.

Establish the intended alignment from an authoritative template, supplied specification, grid or comparable peer elements. If no reference exists, assess internal consistency and label the expected geometry as inferred. Distinguish optical alignment, intentional indentation, wrapped text, superscripts and proportional digits from defects.

For relevant objects, record page, bounding box, coordinate system/origin, rotation and scale. Normalize PDF rotation/crop origins before comparing coordinates. Use PDF points (1/72 inch) or image pixels with stated dimensions; screenshots of different scales cannot be compared directly.

Check each applicable relationship:

| Relationship | What to measure or inspect |
| --- | --- |
| Label to value | Correct row/box, shared baseline or intended vertical centering, sufficient separation, unambiguous association |
| Numeric columns | Decimal anchor where decimals exist; otherwise intended right edge; consistent sign/currency placement; units and precision |
| Table geometry | Column edges, row baselines/heights, cell padding, borders, merged spans, totals rules and continuation headers |
| Text containment | Actual visible glyph/ink extent versus usable field bounds, including ascenders, descenders and negative signs |
| Spacing | Peer indents, tab positions, paragraph spacing, line spacing and repeated label/value gaps |
| Page geometry | Margins, header/footer positions, page numbers, trim/crop boundaries and repeated-copy registration |
| Object layering | Text on top of text, obscured digits, white text, filled rectangles, clipping masks, image and signature overlap |
| Readability | Effective font size, contrast, scan clarity and amount legibility at intended output scale |

Quantify visible deviations where coordinates are accessible: for example, right edge differs by 2.4 pt from comparable rows. Do not claim measured geometry from visual impressions. Automated bounding-box overlap is a candidate finding, not proof: nested objects, intentional overlays and glyph padding need visual confirmation.

Use the user's/template's tolerance when supplied. Otherwise record measured deviation and visible consequence rather than inventing a universal pass tolerance. Small differences without a visible or functional consequence are observations; any clipped digit or value associated with the wrong row is actionable regardless of size. Report currency tolerance separately from layout tolerance.

When comparing a reference and candidate, register equivalent pages by dimensions, rotation and stable anchors; compare only corresponding regions. Pixel differences can arise from antialiasing, compression and font rendering. Confirm suspected differences visually and semantically; never use a raw image-diff percentage as proof of an error.

For a layout finding, provide the page/region, expected relationship, observed displacement or clipping, readable crop or annotated evidence when possible, consequence and suggested correction. Keep evidence copies separate from originals and avoid exposing unrelated sensitive fields.
