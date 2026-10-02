# Document Checker

A browser-based review aid for Canadian T4, T1, T2 and paystub PDFs. Confirm suggested inputs against the PDF before relying on a result. Only the listed checks are automated; this application is not an exhaustive document audit or a tax/payroll calculation engine.

## Run and check

Serve this directory with `python -m http.server 8000` and open `http://localhost:8000`. Run `node check.cjs` for deterministic arithmetic, parsing, extraction and geometry regressions. No build step is required. PDF.js and OCR libraries/language data load from external CDNs, so an internet connection is needed. Document content is processed locally and is not uploaded by the application.

## Guided accuracy skill

The complete [accuracy skill](skills/accuracy/SKILL.md) is included at `skills/accuracy/`. Copy that whole directory to your skill installation directory when needed. It includes structural, field-by-field, financial, source reconciliation and rendered alignment audit instructions. Read its [Document Checker supplement](skills/accuracy/references/document-checker.md) when auditing or changing this app. The skill guides the agent; it does not run inside the browser app.

## Automated coverage

- T4: selected CRA-style candidate fields; 2024 and 2025 CPP/CPP2/EI ceilings outside Quebec; conditional annual contribution comparisons; pension-number and dental-code formats; conflicting extracted candidates.
- T1: selected summary arithmetic and contradictory refund/balance checks.
- T2: selected taxable-income arithmetic with a manually supplied deductions total.
- Paystub: current and YTD gross-to-net and regular hours times rate.
- Identity: comparison with supplied names/addresses and postal-code format. Differences need confirmation; legal identity and address existence are not verified.
- Geometry: possible amount-row, column and name-baseline outliers; possible page-crop overflow; heuristic comparison against a reference with matching dimensions, crop origin, rotation and page order.

Unknown or mixed document types require selection. Type/year suggestions use content; conflicting years remain blank. Province of employment must be confirmed from its source, not inferred from a mailing address. Numeric inputs accept ungrouped digits or consistent comma/space thousands groups and at most two decimal places; alternative decimal locales or higher-precision rates require manual review. Invalid or unsupported input is never silently repaired.

Confirmed arithmetic compares exact cents with no blanket two-cent allowance. Product rounding uses half away from zero. Missing inputs remain blank. Annual contribution estimates remain Needs review because payroll rounding, eligibility and actual withholding need source records. A T4 may correctly report unreimbursed overdeductions; an excess is not automatically a transcription error.

## Results and layout

Pass means only the stated check passed on confirmed inputs. Editing inputs invalidates confirmation. No financial mismatch is presented as confirmed before inputs are confirmed. Alignment pairings are heuristic and produce Needs review rather than proven errors.

Click a Mismatch or Needs review row, or press Enter/Space while it is focused, to open its page and any locatable overlay. Missing reference regions are not drawn at invented actual-document locations. Red overlays never modify the PDF. Default layout tolerance is 2 PDF points, adjustable from 0.5 to 12; it is an outlier threshold, not a universal standard. Scans, mismatched page geometry, missing reference pages and unusable text explicitly report blocked alignment checks.

Download review exports JSON with confirmed inputs, checks, file SHA-256 when available, page-level extraction/alignment coverage, preview-rendered state, reference/tolerance and unperformed audit dimensions. A rendered preview does not establish human visual review. The read-only WebMCP tool also includes coverage when supported.

## Limits and privacy

Maximum 20 MB and 40 pages per PDF. English OCR is attempted on pages with very little extracted text; mixed image/text pages can still contain unrecognized values. Complete form-tree/appearance agreement, hidden content, attachments, cryptographic signatures, all document fields/schedules, statutory eligibility, cross-source reconciliation and human visual review are not automated. Follow the full skill for those checks and report unavailable evidence.

PDFs are never changed or added to this repository. No browser storage or server document storage is used. Clearing/closing discards application state; downloaded reviews remain on disk and can contain sensitive values. CDN-loaded code executes in the page: local processing is not a claim of offline isolation.

## Audit and validation

See [AUDIT.md](AUDIT.md) for findings, fixes and verification limits. The current deterministic regression suite and JavaScript syntax checks pass. Browser checks confirmed the demo flow, tentative results, all 13 selectable provinces/territories and Quebec rule gating. Browser PDF upload/rendering was blocked by the extension's file-access setting, so this revision has not completed end-to-end PDF/OCR/overlay testing. Do not treat historical browser testing of previous revisions as verification of this revision.
