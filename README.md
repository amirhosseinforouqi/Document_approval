# Document Checker

Serve this folder as a static website and choose PDF files. Documents are processed in the browser, not uploaded to the site. Confirm the extracted inputs beside the source PDF before relying on any result. Download review exports the active document's inputs and findings as JSON.

## Coverage

- T4: candidate extraction for CRA-style slips; 2024 and 2025 CPP/CPP2/EI ceilings and selected arithmetic outside Quebec; pension-number and dental-code formats; duplicate-copy candidate conflicts; year comparisons for matching confirmed identities.
- T1: selected summary lines, income/deduction arithmetic, refund/balance arithmetic.
- T2: lines 300 and 360, with a manually confirmed total of deductions from lines 311â€“352.
- Paystubs: gross minus deductions equals net, hours times rate equals regular earnings, year-to-date gross-to-net.
- Spelling: comparison against a user-supplied correct name/address and differences across documents. Proper-name ordering and address abbreviations may trigger review. Postal-code format is checked; street existence is not verified.
- Scans: English OCR and page preview. Low-resolution or complex scans may yield no reliable numeric candidates; manually enter values from the source. Extraction never changes the PDF.

## Limits

This is a review aid, not a tax filing or payroll engine. It does not calculate full T1/T2 tax liability, validate every schedule, verify legal names or postal addresses, or calculate exact per-pay withholding. CPP eligibility, age, exemptions and multiple provinces/employers may require manual review. No deduction or blank value is invented. Only specified equations are checked; a passing result does not establish overall correctness or document authenticity.

Maximum 20 MB and 40 pages per PDF. Reading libraries and OCR language data need an internet connection. No browser storage or server-side document storage is used. Clearing documents or closing the page discards the app's in-memory document state; downloaded review files remain where the user saves them.

## Validation

Run `node check.cjs` for the small calculation/extraction check. Browser-tested against two 2024/2025 T4 PDFs and synthetic T1, T2, paystub and scanned-PDF inputs. Scan reading worked, but the low-resolution T4 scan did not produce reliable numeric candidates. Browser WebMCP support was not available for validation; normal user controls do not depend on it.

## Run locally

From the repository folder, run `python -m http.server 8000`, then open `http://localhost:8000`. Any static web server works. Opening `index.html` directly may block the browser modules.

The repository contains only application code and documentation, never uploaded PDFs. No build or package installation is required. Run `node check.cjs` to verify the calculation rules.
