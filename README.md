# Document Checker

Serve this folder as a static website and choose PDF files. Documents are processed in the browser, not uploaded to the site. Confirm the extracted inputs beside the source PDF before relying on any result. Download review exports the active document's inputs and findings as JSON.

## Coverage

- T4: candidate extraction for CRA-style slips; 2024–2026 CPP/CPP2/EI ceilings and selected arithmetic outside Quebec; pension-number and dental-code formats; duplicate-copy candidate conflicts; year comparisons for matching confirmed identities. Confirm employment province from box 10, not the employee's home address. Optional CPP pensionable months (0–12) control proration; unknown months remain a review flag.
- T1: selected summary lines, income/deduction arithmetic, refund/balance arithmetic.
- T2: lines 300 and 360, with a manually confirmed total of deductions from lines 311â€“352.
- Paystubs: gross minus deductions equals net, hours times rate equals regular earnings, year-to-date gross-to-net. Explicit YTD labels are kept separate from current totals; ambiguous multi-value rows require confirmation.
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

