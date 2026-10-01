# Document Checker

Serve this folder as a static website. Upload an applicant ID PDF, confirm its extracted name and address, then choose the related financial PDFs together. Documents are processed in the browser, not uploaded to the site. Confirm each document's identity, dates, version and amounts beside its source before accepting matches. Download JSON review exports the complete batch and accuracy ledger. Download printable report exports a standalone HTML report with Print / Save as PDF.

## Applicant ID and document sets

The Applicant ID reference section opens an ID PDF in the normal preview and suggests its name/address. Edit extraction errors, then confirm the reference. Personal T1s, NOAs, T4s and paystubs are compared with that reference. Identifier numbers are not used as applicant comparison inputs. Populated PDF widgets are read locally to check canonical values against their visible appearances; recognized sensitive values are masked in reports. ID formats and scans vary; missing or ambiguous names/addresses require manual entry from the preview. The tool does not query a registry or certify identity.

Corporate NOAs (CNOAs) and T2s are compared with each other; the applicant's personal name is not substituted for a corporation. An optional confirmed company reference supplies the correct company name/address. Capitalization, punctuation, postal-code spacing and supported street abbreviations are normalized; substantive differences and name-order variations remain visible for review.

- NOA + T1: compare common income, tax and credit lines for the same named person and calendar year. An assessed difference is Needs review, because CRA adjustments and displayed rounding can explain it.
- CNOA + T2: compare confirmed common income/tax lines for the same company and fiscal start/end dates. A calendar-year match alone is insufficient.
- T4 + paystubs: compare annual income, tax, CPP, CPP2, EI and RPP totals with the confirmed final paystub for the same employer and year. Use explicit YTD taxable gross, or confirm that YTD gross includes the same taxable earnings/benefits. Interim stubs do not establish annual totals.
- Multiple paystubs: check YTD increases against current amounts only when the employee, employer, year and adjacent periods are confirmed. Gaps, overlaps and possible adjustments remain review items. YTD balances are never summed.
- Original/amended and assessed/reassessed records stay separate. Mark superseded records to exclude them; duplicate or competing records prevent automatic reconciliation passes.

Comparisons show both values and their difference. Click a Mismatch or Needs review to select its source document, page and red regions; use either Show source button to inspect the other PDF. Keyboard activation works too. Cross-document equality is labelled internally consistent, not independent tax verification.

Use Add another amount to compare for fields that are not extracted. Use the same label only for the same amount, period and basis; include the applicable year in carry-forward labels. Custom fields are compared in the supported NOA/T1, CNOA/T2 and T4/paystub sets. Blank values stay blank. Unmapped monetary text is separately flagged by page with red preview regions; it is not silently marked checked.

## Accuracy skill workflow

The platform adapts the supplied accuracy skill into automatic checks plus an evidence-led review. See [ACCURACY.md](ACCURACY.md) for the requirement-by-requirement implementation report and remaining limits.

Use **Record review of this page** beneath the preview to record readable visual inspection, partial/unreadable pages, printed page or schedule numbers and evidence. Confirming extracted inputs alone does not review an entire page. Then use **Accuracy skill checklist for this document** for supporting records, eligibility, unsupported arithmetic/schedules, visual details and carry-forwards. Every reviewer conclusion requires notes; changing the batch inputs makes old evidence stale.

**Accuracy review and report** uses Verified, Internally consistent, Error, Needs confirmation, Not verifiable and Not applicable, with separate Critical/Major/Minor severity. It includes formula inputs, expected values, signed differences, rule links and periods, exact source locations, all candidate occurrences, schema blanks, unmapped amounts, canonical PDF form fields and extracted page text rows. Selecting unresolved findings or field-ledger sources opens the original PDF in the red preview.

Printable HTML and JSON include the full ledgers and all findings. Unreviewed pages and missing evidence remain explicit; automatic agreement does not certify eligibility, tax liability, identity or authenticity. Reports mask recognized identifiers and NETFILE codes, but retain names, addresses and amounts; inspect free-text evidence before sharing. The browser does not run an AI agent or execute the SKILL.md file.

## Coverage

- T4: candidate extraction for CRA-style slips; 2024–2026 CPP/CPP2/EI ceilings and selected arithmetic outside Quebec; pension-number and dental-code formats; duplicate-copy candidate conflicts; year comparisons for matching confirmed identities. Confirm employment province from box 10, not the employee's home address. Optional CPP pensionable months (0–12) control proration; unknown months remain a review flag.
- T1: selected summary lines, income/deduction arithmetic, refund/balance arithmetic.
- T2: lines 300 and 360, with a manually confirmed total of deductions from lines 311–352; selected tax/credit fields for CNOA comparison, without recalculating liability.
- NOA/CNOA: known line numbers or labelled summary amounts, assessment-balance arithmetic where supplied, and comparisons to the corresponding return. Account balances, deposits, instalments and carry-forwards are not silently equated to return refunds.
- Paystubs: gross minus deductions equals net, hours times rate equals regular earnings, year-to-date gross-to-net; current and YTD tax/CPP/CPP2/EI/RPP and taxable gross. Explicit YTD labels and supported Current/YTD columns are kept separate; ambiguous multi-value rows require confirmation.
- Spelling: comparison against a user-supplied correct name/address and differences across documents. Proper-name ordering and address abbreviations may trigger review. Postal-code format is checked; street existence is not verified.
- Scans: English OCR and page preview. Low-resolution or complex scans may yield no reliable numeric candidates; manually enter values from the source. Extraction never changes the PDF.

## Limits

This is a review aid, not a tax filing or payroll engine. It does not calculate full T1/T2 tax liability, validate every schedule, verify legal names or postal addresses, or calculate exact per-pay withholding. CPP eligibility, age, exemptions and multiple provinces/employers may require manual review. No deduction or blank value is invented. Only specified equations are checked; a passing result does not establish overall correctness or document authenticity.

Maximum 20 MB and 40 pages per PDF. Reading libraries and OCR language data need an internet connection. PDF.js is loaded when a PDF is opened, so a blocked library does not disable the fictional demo. Failed OCR leaves the source available for manual review. Rendering is bounded to 4,096 pixels per side and 16,777,216 pixels. No browser storage or server-side document storage is used. Clearing documents also clears document-derived inputs, text, errors and export links; downloaded review files remain where the user saves them.

## Validation

Run `node check.cjs` for the calculation, extraction, alignment and asynchronous loading checks. See [AUDIT.md](AUDIT.md) for the October 1, 2026 findings, regression cases, browser validation and remaining limits. The updated code was browser-tested with fictional PDFs; no client documents are included. Review JSON generation is checked, but file saving through the preview browser could not be confirmed.

## Run locally

From the repository folder, run `python -m http.server 8000`, then open `http://localhost:8000`. Any static web server works. Opening `index.html` directly may block the browser modules.

The repository contains only application code and documentation, never uploaded PDFs. No build or package installation is required. Run `node check.cjs` to verify the calculation rules.

## Alignment and preview overlays

The preview marks locatable numerical mismatches and alignment findings in red. Use Show on preview to open the affected page. Toggle Show errors in red to inspect the original rendering; the PDF itself is never changed.

Automatic alignment checks flag probable amount-row baseline differences, amount-column right-edge outliers, and name fragments on different baselines. These are review flags, not proof that the layout is wrong. Different rows and columns can be intentional.

For more precise comparisons, select a correctly aligned reference PDF using the same template, page dimensions, crop origin, rotation and page order. Each document keeps its own reference. Names/text compare left edges; numbers compare right edges and baselines. The report gives the measured left/right/up/down displacement. Default tolerance is 2 PDF points and can be adjusted from 0.5 to 12 points. Different text lengths, text-run segmentation, templates or missing regions may need manual review. Arbitrary PDFs cannot be guaranteed perfectly aligned by these heuristics.

Scanned PDFs retain OCR and preview support, but precise alignment checking is skipped because OCR positions are approximate. Test coverage includes directional shifts, tolerance changes, row and column outliers, mismatched reference dimensions, scan safeguards, visible red canvas overlays, preview navigation and mobile width.

## Click a review result

Every Mismatch and Needs review row is selectable. Click anywhere on the row, or focus it and press Enter or Space, to immediately show its page in the preview and enable red overlays. Alignment findings and locatable field checks highlight the relevant text. General reviews and missing inputs without an identifiable source region still open the preview and explain that there is no precise text location. Passing rows remain informational.

