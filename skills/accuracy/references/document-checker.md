# Auditing this repository

Read this reference when reviewing or extending Document Checker. The browser app and this skill have different coverage. The skill guides an exhaustive evidence-based audit; the app automates selected PDF extraction, arithmetic and geometry heuristics. Installing the skill does not add those full capabilities to the application.

## Trace all consumers

- `engine.js`: amount parsing, cent conversion, schemas, type/year suggestions, candidate extraction and financial checks.
- `layout.js`: text geometry, heuristic reference matching, row/column outliers, crop checks and finding locations.
- `app.js`: PDF/OCR processing, confirmation state, page preview, reference loading, results, JSON export and read-only WebMCP output.
- `index.html`: available controls, limits, accessibility and scope claims.
- `check.cjs`: runnable deterministic regression checks. Run `node check.cjs`; also check JavaScript syntax and the real browser controls after UI or lifecycle changes.

Trace shared helpers into result rows, overlays, comparisons, export and WebMCP. A correct result in one view does not establish that all consumers reflect it.

## Required regression cases

1. Reject malformed grouping, unmatched parentheses, double signs, scientific notation, non-finite values and amounts outside exact-cent precision. Preserve blank versus zero. Never repair ambiguous numeric text silently.
2. Reconcile exact cent sums/differences; flag a one-cent mismatch. Round products at the documented stage. Test positive/negative half-cent boundaries and numeric overflow. Hour and rate inputs currently allow at most two decimal places; unsupported precision must be explicit.
3. Check missing and invalid operands separately; keep a result for a calculation that could not run. Unknown/mixed document types apply no financial rules. Do not infer tax year from a filename or province of employment from a mailing address.
4. Test negative contributions, annual caps, unsupported years/provinces, Quebec and contradictory refund/balance fields. Annual contribution estimates cannot establish actual withholding or a slip error: payroll rounding, eligibility and unreimbursed overdeductions matter.
5. Confirming inputs is not confirming entitlement or source correctness. Unconfirmed financial outcomes stay tentative. Editing a field, year, province or document type must invalidate confirmation.
6. Reference pairing by proximity/text is heuristic even when text agrees. Alignment findings require visual confirmation; unmatched reference coordinates must not masquerade as actual-document evidence. Check nonzero crop origins, rotated pages, missing reference pages, scans, no usable tokens and invalid tolerance settings.
7. Exercise replacement with an invalid reference, two overlapping reference loads, removal/clearing during load, failed PDF extraction, interrupted rendering and page navigation. Stale async results must not restore removed data or obsolete overlays.
8. Test real select options, keyboard activation, mobile width, preview overlays and export. A demo populated from JavaScript can hide a broken select element.
9. Export page-level extraction and alignment execution, reference/tolerance, input confirmation and coverage limitations. A rendered preview is not a completed human visual review. Comparison counts are not full field coverage.
10. Audit public claims against demonstrated capability. Do not claim a current rule verification date, exhaustive structure review, authenticity, source reconciliation or complete visual QA merely because parsers/tests pass.

## Remaining manual checks

The app does not provide complete PDF structure validation, stored-form/appearance comparison, attachment/layer inspection, signature verification, mixed text/image OCR coverage, full document-field inventory, full payroll/tax eligibility, source-document reconciliation or human visual review. Use the full skill's format-specific checks and record blocked checks individually. Do not turn the app's limited report into an exhaustive-audit certificate.

## Rule evidence

- CRA T4 instructions: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/completing-filing-information-returns/t4-information-employers/t4-slip.html
- CRA 2025 payroll parameters: https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables-previous-years/t4032nl-july-2025/t4032nl-july-general-information.html
- CRA line 23600 instructions: https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-23600-net-income.html

These are source pointers, not permanent verification of future periods. Recheck the appropriate archived edition when changing a rule.
