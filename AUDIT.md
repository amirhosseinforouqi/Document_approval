# Document Checker audit — October 1, 2026

Audited repository: `amirhosseinforouqi/Document_checker` (formerly `Document_approval`). Baseline: `33e496532edf05439b59c8edaf2ac93be1b92fbc`. All six source files were read. The original `node check.cjs` passed despite the defects below.

The accompanying changes fix 18 groups of reproducible calculation, extraction and state-handling defects. They do not establish that every PDF or every tax calculation is supported. No client PDFs or personal data are included in this repository.

## Findings and fixes

| Priority | Defect in the baseline | Reproduction or consequence | Change |
|---|---|---|---|
| P1 | Province dropdown contains closing tags without opening option tags | Only the initial option is reliably selectable; stored province and visible selection can disagree | Generate complete options for all 13 provinces/territories; browser verified 14 options including Not confirmed |
| P1 | Malformed money strings silently become different numbers | `1,2.00` becomes 12; `100)` becomes 100; `(-100.00)` becomes positive 100 | Strict grouping and balanced signs/parentheses; reject malformed and non-finite values |
| P1 | Negative contributions pass annual ceiling checks | T4 box 16 of -10 receives a CPP ceiling Pass | Validate amount domains first; invalid negative values cannot receive arithmetic or ceiling passes |
| P1 | Home address is used as province of employment | A Quebec address can select Quebec rules for an Ontario job | Leave province unconfirmed; instruct the user to read T4 box 10 |
| P1 | CPP2 assumes full-year pensionable eligibility | CRA's 2025 two-month example has box 26 of 12,634.65 and CPP2 of 30.05; the baseline compares it with zero | Add optional confirmed pensionable months; prorate thresholds and ceilings; unknown months remain Needs review |
| P1 | Name comparison drops all non-ASCII characters and ignores missing document identities | Different Chinese names both normalize to empty strings and can pass; supplying both references hides absent document names/addresses | Preserve Unicode letters and word boundaries; flag missing document identities |
| P2 | Exact arithmetic allows two-cent differences | Gross 2,000 less deductions 500 with net 1,500.01 receives Pass | Compare rounded amounts to the cent for T1/T2/paystub equations and hard contribution/earnings ceilings |
| P2 | T1 checks one refund/balance field and ignores the other | A correct 500 refund plus an incorrect positive balance owing can pass the selected calculation | Check every supplied refund and balance field, including the expected zero counterpart |
| P2 | Form detection uses any occurrence of 15000 and year detection prioritizes filenames | A 15,000 paystub is classified as T1; a conflicting filename can select the wrong contribution year | Prefer form markers and labelled source years; exclude decimal amounts from loose year matches; ambiguous years stay blank |
| P2 | Duplicate amounts are compared as strings when populated but numbers when reviewed | `1,000.00` and `1000.00` leave a field blank without a conflict warning | Use the same candidate comparison in both paths; preserve pension-registration leading zeros |
| P2 | YTD-only paystub labels populate current fields | YTD Gross Pay can be read as current gross | Separate explicit YTD labels; preserve ambiguous multi-value rows as conflicting candidates |
| P2 | Highlighting searches for equal values anywhere on a page | Two unrelated fields with the same number are both highlighted | Retain candidate rectangles and label rectangles; use shared finding-location logic for clicks and automatic overlays |
| P2 | Clicking a finding centers the whole canvas rather than its affected region | The right page opens, but the selected value can remain outside the scrolled preview | Focus the selected source region within the preview and keep its explanatory note visible; ignore outdated clicks |
| P2 | Reference PDFs apply globally, retain old data after failed replacement, and can reappear after removal | Switching T4 to paystub applies the T4 reference; a late load can restore a removed reference | Bind each reference to its document; clear before replacement; ignore outdated loads after Remove/Clear |
| P2 | A failed PDF-library import prevents the entire UI from starting; failed OCR discards the PDF | Offline/CDN failure disables even the fictional demo; OCR failure loses the readable preview | Load PDF.js on demand; show loading errors; retain the source PDF and manual-review fields if OCR fails |
| P2 | Failed reads leak PDF resources and OCR canvases | Errors after opening a PDF bypass destruction; failed recognition leaves its canvas allocated | Dispose unowned PDFs and loader tasks on failure; release OCR canvases in finally |
| P2 | Clear documents leaves text, fields, error filenames and exported Blob links in the DOM | Arrays clear while hidden source values and download data remain accessible | Clear document-derived DOM values and errors, revoke the review URL, and reject late reference completions |
| P2 | Rendering ignores enormous page dimensions and reference crop origins | A small encoded PDF can require an enormous canvas; equal-sized pages with different crop origins are incorrectly compared | Bound renders to 4,096 pixels per side / 16,777,216 pixels total; reject different crop origins for reference alignment |

2026 CPP/CPP2/EI limits were also added and verified against current CRA sources. The baseline explicitly supported only 2024–2025; this is a coverage update rather than a previously claimed capability.

EI and CPP2 annual-rate differences are review flags rather than unconditional error claims: per-pay rounding and pensionable eligibility require payroll records. Hard negative-value and ceiling violations remain mismatches. Code 40 is included in box 14 once; pension adjustment and actual withholding remain record-dependent.

## Verification

Run `node check.cjs`. It covers the original calculation/alignment/navigation checks plus the audit regressions and controlled asynchronous loading tests. `node --check app.js` checks syntax. The controlled tests verify disposal after page-count/page-read failures, OCR failure fallback, review JSON contents, failed reference replacement, Remove/Clear during reference loading, and oversized viewport handling.

Browser validation used fictional files only:

- Loaded a T4 and a two-page paystub in one batch; a corrupt PDF was rejected while both valid documents remained available.
- Verified all province choices and the Quebec review guard.
- Read printed tax year 2025 despite a filename containing 2026; left employment province blank despite a Quebec home address.
- Extracted current and YTD paystub values separately and flagged a one-cent net-pay mismatch.
- Started on page 2, clicked the mismatch, and verified that page 1 and its relevant source amounts appeared with red overlays.
- Loaded an identical reference T4; alignment findings cleared. Switched to the paystub and verified that the T4 reference did not follow it.
- Entered a negative EI amount, verified the mismatch, and clicked through to its T4 source region.
- Cleared the documents and verified that name, address, extracted text, error filenames and review download links were empty.
- Verified that review export produces a visible download link. The preview browser did not report a Blob download event, so actual file saving through that browser remains unverified; exported JSON bytes are checked separately.

## Remaining limits

### Applicant ID and document-set additions

The follow-up adds an uploaded applicant ID reference with editable extracted name/address and an explicit confirmation gate. Personal documents use that reference; corporate documents use corporate identity, with an optional company reference. Government identifier numbers are not extracted as fields.

Batch reconciliation now compares common NOA/T1 and CNOA/T2 fields, confirmed final-year T4/paystub totals, and adjacent paystub YTD increases. It requires matching identity, year or complete fiscal period, record version and relevant employer/basis inputs. YTD balances are not summed. Superseded documents are excluded and competing records are flagged. Assessment differences remain review items because CRA may adjust a return. Shared custom labels provide manual comparisons for additional amounts in the supported sets; their period and basis require confirmation.

Each comparison reports both values, the difference and source targets. Clicking a non-pass row opens the appropriate document/page with red source regions; separate buttons open either PDF. Unmapped monetary text is flagged by page for visual/manual review. JSON export includes all documents, source page/method coverage, the confirmed reference and cross-document findings; it does not claim that every schedule or visual field was certified.

The native checks cover ID/notice extraction, Current/YTD columns, identity confirmation, company separation, unequal tax/fiscal periods, invalid dates, missing inputs, negative deductions, interim/final/basis constraints, duplicate/superseded records, additional labelled fields, source regions, batch export and source switching. Browser testing uses seven fictional PDFs across 12 pages, including deliberately unequal NOA/T1 taxable income and CNOA/T2 total tax. Both sides of a comparison were opened on page 2 with red highlights. No client records are included.

This remains a document review tool. It does not compute full T1/T2 liabilities, verify document authenticity, validate every schedule, prove a legal identity or address, or reproduce exact employer withholding. Name/address extraction, ambiguous columns, complex forms and scans require manual confirmation. Alignment without a matching template is heuristic and can flag intentional layouts. OCR and PDF libraries require internet access. Large scanned batches can take time; this audit did not add a scan-cancellation workflow.

Fixes on an audit branch do not update the default branch or production until merged and released. A hosting service may automatically build a PR preview. Live-host deployment and authentication were outside this repository audit.

## CRA references

- [T4 box instructions, including province of employment](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/completing-filing-information-returns/t4-information-employers/t4-slip.html)
- [CPP2 calculations and part-year proration](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/calculating-deductions/how-to-calculate/calculate-second-cpp.html)
- [Payroll guide: 2025 part-year contribution example](https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4001/employers-guide-payroll-deductions-remittances.html)
- [2026 contribution and EI parameters](https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables/t4032ab-jan/t4032ab-january-general-information.html)
- [CRA NOA summary lines and explanations of assessed differences](https://www.canada.ca/en/revenue-agency/services/tax/individuals/educational-programs/after-sending-tax-return.html)
- [CRA T4 and final-paystub year-to-date comparison](https://www.canada.ca/en/revenue-agency/services/tax/individuals/educational-programs/starting-work.html)
- [T2 tax/credit line definitions](https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/t4012/t2-corporation-income-tax-guide-chapter-8-page-9-t2-return.html)


## Accuracy workflow follow-up — October 1, 2026

### Production integration — October 2, 2026

The release combines PR #1 with main commit `f3d01c1ceaa89c32fb8eb31bbe80a8b25e5b7156`. All five existing `skills/accuracy/` files are preserved. The latest-main calculation, classification, confirmation, identity and geometry regressions run alongside the applicant ID, batch reconciliation, structured calculation, page evidence, export and lifecycle checks. Incoming tests that previously accepted filename guesses or automatic annual-rate passes were corrected to preserve the safer main behavior.

The integrated engine preserves meaningful name punctuation, exact-cent boundary checks, signed half-cent product rounding, refund/balance contradictions, conditional annual comparisons and unconfirmed-input safeguards. Unknown or mixed types apply no financial rules. Canonical PDF values and batch source regions remain available. Missing reference regions never invent actual-document rectangles; invalid/missing geometry produces a visible blocked check. Non-locatable findings do not crash preview overlays. File SHA-256, preview-rendered state, alignment execution, references and tolerance are retained in JSON and the accuracy ledger; changing source hashes invalidates prior reviewer evidence.

The [CRA T4 reporting instructions](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/completing-filing-information-returns/t4-information-employers/t4-slip.html) were checked October 2, 2026 for boxes 16, 16A and 18: unreimbursed overdeductions can be reported on the slip. Exceeding an annual contribution comparison therefore requires payroll review rather than an automatic slip-error conclusion. No full withholding calculation or new tax-year rate was introduced during this integration.

Validation: the combined `node check.cjs` script and syntax checks pass, including PDF/OCR cleanup, source hashes, blocked alignment exports, absent reference rectangles, conditional contribution checks, one-cent arithmetic, applicant references, document-set comparisons, coverage, privacy and stale-evidence behavior. Browser checks and production deployment verification are recorded separately from these deterministic checks.

The combined release was browser-checked locally with a fictional ID and fictional paystub. The ID name/address extracted and the PDF rendered. After confirming the paystub inputs, the intentional $0.01 net-pay discrepancy became an Error; pressing Enter on its result opened the source with red regions. The accuracy section retained six statuses and incomplete-page coverage. No browser error was captured in these checks. The full eight-document browser exercise described below belongs to the earlier PR revision; this release's additional validation is the combined deterministic suite plus these focused browser checks.

The requested accuracy skill is now represented by a browser review ledger, scoped six-status findings, separate severity, evidence-backed document-specific checklists, printable HTML and complete JSON. [ACCURACY.md](ACCURACY.md) maps every policy area to automatic coverage, guided review and remaining limitations. The policy source hash is recorded in the report.

The change reuses the existing checker and preview navigation. Equations now return structured inputs/formula/expected/difference/rounding evidence, and subtraction uses integer cents. Decimal parsing validates exact cents; hour/rate multiplication uses integer arithmetic. Unsafe numeric ranges and unsupported provinces cannot become automatic passes. Explicit T2 deductions totals can be located from their source label. Page review is independent of extracted-input confirmation and requires a rendered page plus notes.

Reports retain every page, candidate occurrence, known blank, unmapped monetary run, canonical widget and extracted text row; arbitrary field semantics remain unverified. Possible duplicate pages, crop-bound concerns, invalid/reversed dates and printed numbering are flagged. Canonical/visible numeric differences are review concerns. Evidence conclusions are bound to the current batch, so edited inputs cannot silently reuse stale confirmations. Sensitive widget/custom identifiers and NETFILE codes are masked, and printable HTML escapes document content.

The native assertion script passes calculation, classification, lifecycle, coverage, privacy, escaping, stale-evidence and export regressions. Browser validation uses eight fictional PDFs / 13 pages: both assessed differences stay review concerns, while a confirmed one-cent net-pay error is an Error and opens red source regions. Missing page evidence is rejected; a single recorded page leaves the other 12 explicitly unreviewed. Full tax liability, per-pay withholding, arbitrary schedules, fine visual completeness and legal identity still require independent evidence-led review. No client records are published.
