# Accuracy workflow integration report

Implemented October 1, 2026 from the supplied `accuracy/SKILL.md`. The source policy SHA-256 is `840106EA5312D757D36F5806EB590C781DD99F11609420E5AD5159C8C2304D36`.

The platform now applies the skill as an automatic-check and evidence-led review workflow. It does not execute a Codex skill or an AI agent in the browser. The original PDFs remain unchanged. Missing evidence remains unresolved, even when other amounts match.

## What was added

| Skill requirement | Platform behavior | Scope and limitation |
| --- | --- | --- |
| Separate arithmetic, rule eligibility, source agreement, document consistency and presentation | Accuracy findings have a category, method, status and separate Critical/Major/Minor severity | Reviewer-entered conclusions are explicitly identified; matching documents do not independently validate tax liability |
| Six accuracy statuses | Verified, Internally consistent, Error, Needs confirmation, Not verifiable and Not applicable | Confirmed deterministic arithmetic can be Verified; annual contribution comparisons and document equality remain Internally consistent; assessment differences need confirmation |
| Every page recorded | Page ledger includes PDF page, printed page/schedule, extraction method, rendering and unreviewed/partial/visual/unreadable status | A page cannot be recorded visually reviewed until it has rendered and review notes are supplied. Confirmation of extracted inputs alone is insufficient |
| Field and content ledger | Known fields, relevant schema blanks, every candidate occurrence, unmapped monetary runs, populated PDF widgets and every extracted text row are retained | Unknown field semantics, missing positions and uncertain units are explicit. No blank becomes zero; page inspection does not prove unsupported arithmetic |
| Reproducible arithmetic | Calculation records contain exact displayed inputs, target, expected amount, signed difference, formula and rounding policy | Money subtraction compares integer cents. Hours/rates retain their units. Unsafe large calculations require an independent check; no arbitrary financial tolerance is used |
| Period and version handling | Existing identity/year/fiscal-period/employer/final-paystub gates remain; invalid or reversed dates, duplicate text pages and inconsistent printed numbering are flagged | Legitimate copies or schedule numbering need confirmation. Superseded records remain visible but are excluded from reconciliation |
| Source locations and red preview | Accuracy findings and ledger source buttons use the existing document/page/region navigation; Enter/Space activation works | Unlocated or general evidence checks open the source without inventing a rectangle |
| Text and visual review | Existing OCR and alignment checks are retained; crop-bound concerns and canonical form values are added | OCR coordinates and layout heuristics are not proof of an intended layout. Clipping, fonts, small digits, overlaps and form appearances still need readable inspection |
| Canonical PDF values | Populated widget values and nearby extracted text are recorded; numerical differences are explicitly flagged | An absent nearby text value leaves the visible appearance unverified; no canonical value silently replaces the displayed one |
| Document-specific checks | Evidence checklists cover T4, T1, T2, NOA/CNOA, paystubs and applicant ID | These cover unsupported boxes/schedules, family eligibility, payroll classifications, pension calculations, corporate tax accounts, adjustments and carry-forwards without pretending to calculate them automatically |
| Rule provenance | Findings include official links, applicable document period, reference date and coverage limits | Configured CPP/CPP2/EI rates cover 2024–2026 in supported Canadian provinces outside Quebec. T1 requires the actual year/province package; the linked T2 guide is 2025. No live CRA eligibility lookup is performed |
| Evidence lifecycle | Checklist conclusions require evidence notes and are tied to the current documents, inputs and references | A changed batch fingerprint makes old conclusions stale and Not verifiable until recorded again |
| Privacy and document instructions | Reports mask recognized identifiers, account numbers, NETFILE codes and sensitive widget/custom fields; report HTML escapes document text | Names, addresses and financial amounts remain for comparison. Free-text exports should be checked before sharing. PDF content is data and does not execute instructions |
| Final report and completion gate | Printable HTML and JSON include coverage, all findings, formulas, sources, missing inputs, actions, field ledger and page/content ledger | Unreviewed pages, missing evidence, unreadable extraction or unresolved ledger entries prevent a complete-review claim |

## Automatic calculation coverage

- T4: configured CPP/CPP2/EI limits and selected annual-rate comparisons; pension registration and dental-code formats. Actual payroll deductions and eligibility remain separate.
- T1: selected income-to-net/taxable-income equations and refund/balance arithmetic. Tax brackets, credit eligibility and the underlying schedules are not recalculated.
- T2: line 300 less confirmed deductions from lines 311–352, floored at zero, to line 360. Explicit labelled deductions totals can now be extracted. Corporate liability and schedules require independent review.
- Paystub: current and YTD gross less total deductions equals net; regular hours times rate equals regular earnings. Exact withholding requires TD1, frequency, province, effective formulas and history.
- NOA/CNOA: supplied assessment-base arithmetic and common return/assessment line comparisons. Adjustments, payments, interest, penalties and offsets may explain differences.
- Document sets: NOA/T1, CNOA/T2, confirmed final-year T4/paystub, adjacent paystub YTD, shared manually labelled amounts, identity/address and competing versions.

Full T1/T2 liability, Quebec calculations, all payroll deduction components, bank matching, arbitrary schedules, identifiers/ownership and cross-year carry-forward formulas require the appropriate records and the evidence checklist. They are not automatically verified merely because fields agree.

## Validation

Run `node check.cjs`. The existing native assertion script covers the original audit regressions and now checks:

- Exact-cent expected values and differences; hour/rate rounding; unsupported province and excessive numeric inputs.
- Scoped status conversion: actual arithmetic errors versus assessed differences, unconfirmed inputs, annual-rate comparisons and missing evidence.
- All-page coverage, unreadable/unrendered pages, duplicate text pages, printed page counts, reversed dates and source targets.
- Evidence notes, stale review fingerprints, Not applicable reasons, complete JSON ledgers and printable HTML generation.
- Identifier/NETFILE/custom-field masking, canonical/visible numerical disagreement, and HTML escaping of hostile document text.
- Actual application loading, cleanup, OCR fallback, reference races, export handlers and source switching.

Browser validation uses eight fictional PDFs over 13 pages. It includes a deliberate $1,000 NOA/T1 difference, a $50 CNOA/T2 difference, and a paystub reporting $3,000.01 net against $4,000.00 gross minus $1,000.00 deductions. The expected net is $3,000.00 and the demonstrated error is $0.01. The paystub also contains a canonical PDF form value for inspection. The accuracy error opens its source with red highlights, and the page-review gate requires notes. No client PDF or applicant ID is included in the repository.

## Using the feature

1. Upload the ID/reference and financial PDFs; confirm the extracted identity, dates, version and amounts against the previews.
2. On each source page, expand **Record review of this page**, inspect it at readable zoom, and save its coverage status and notes.
3. Expand **Accuracy skill checklist for this document**. Record evidence, period-specific rules and conclusions for checks beyond automatic coverage; mask identifiers in notes.
4. Use **Accuracy review and report** to filter findings and open their sources. The field-ledger buttons also show the relevant PDF location.
5. Choose **Download printable report** for HTML, then use its **Print / Save as PDF** button, or **Download JSON review** for the complete structured report.

Implementation files: `accuracy.js` builds the review/report; `app.js` connects existing loading, preview and exports; `engine.js` supplies structured calculation evidence; `index.html` supplies the review controls. No new library or build step was added.
