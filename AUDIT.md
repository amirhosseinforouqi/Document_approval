# Accuracy audit

Reviewed all six original repository files at commit `33e496532edf05439b59c8edaf2ac93be1b92fbc`. Traced numeric parsing, extraction, rule evaluation, reference geometry, preview navigation, UI confirmation, export and WebMCP consumers. The repository did not contain a skill; the full accuracy skill and a repository-specific supplement are now included under `skills/accuracy/`.

## Findings and changes

| Severity | Finding | Resolution |
| --- | --- | --- |
| Major | Province select contained closing option tags without opening tags; only Not confirmed was selectable. Demo state concealed the defect. | Restored all 13 province/territory options; verified in Chrome and added a regression. |
| Major | Mailing address guessed province of employment; filenames took precedence for year; arbitrary PDFs defaulted to Paystub. | Require employment province; derive year/type suggestions from contents, retaining Unknown/blank for unsupported or conflicting evidence. |
| Major | Number parser accepted malformed grouping and unmatched parentheses. | Strict grammar, balanced sign handling and safe integer-cent bounds. |
| Major | Two-cent blanket tolerance concealed real arithmetic discrepancies. | Exact integer-cent reconciliation and explicit product rounding; regression includes a one-cent mismatch. |
| Major | Negative contribution values could pass upper-limit checks. | Reject negatives and invalid province codes; keep missing inputs explicit. |
| Major | Annual EI/CPP2 comparisons could falsely certify withholding or falsely declare slip errors. | Keep annual estimates conditional; excess withholding requires payroll review because unreimbursed overdeductions can be correctly reported. |
| Major | Unconfirmed extraction could produce definitive Mismatch rows. | All unconfirmed financial outcomes remain tentative until inputs are confirmed. |
| Major | T1 could pass a refund while also displaying a nonzero balance owing; absent final inputs skipped the check. | Check contradiction and explicitly report missing/invalid operands. |
| Major | Lossy identity normalization removed accented characters and punctuation, creating false equality. | Preserve Unicode/punctuation, normalize only case and whitespace; differences require confirmation. |
| Major | Guessed reference pairings produced definitive layout mismatches; missing reference objects used reference coordinates as actual evidence. | Keep pairings as review candidates and omit actual-location rectangles for absent reference regions. |
| Major | Crop origins were not compared; skipped alignment checks disappeared from the exported findings. | Check crop origin/dimensions/rotation and publish blocked page checks and coverage. |
| Major | Failed/replaced reference loads could leave stale reference state or race newer state. | Clear obsolete references, version async loads and ignore stale completions; clean up failed PDF objects. |
| Moderate | Export lacked page execution, comparison parameters and explicit unperformed audit dimensions. | Add versioned coverage, reference/tolerance, source hash and preview state, separately from human visual review. |
| Moderate | Application scope was much smaller than an exhaustive skill, with no repository skill available. | Include the full skill, repository regression guidance and explicit capability boundaries. |

## Evidence and checks

- `node check.cjs`: passes existing checks plus malformed-number, exact-cent, rounding, invalid-input, unsupported-type, missing-evidence, contradiction, Unicode and geometry regressions.
- `node --check engine.js`, `node --check layout.js`, `node --check app.js`: pass.
- Chrome demo: tentative outcomes before confirmation, province choices and Quebec rule gating verified.
- Browser upload of a fictional PDF was attempted but blocked by the extension's disabled file-URL access. Real PDF rendering, OCR, red overlays, downloaded export and async-reference browser scenarios remain unverified in this revision. No private source files were used.
- Reference race handling was inspected in code; it has not passed a browser concurrency test.
- Automated geometry tests validate calculations on synthetic tokens; they do not prove correct field matching on arbitrary PDFs.

## Rule source checked

[CRA T4 reporting instructions](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/completing-filing-information-returns/t4-information-employers/t4-slip.html) distinguish actual deductions from contribution limits and instruct employers to report unreimbursed CPP, CPP2 and EI overdeductions. Therefore an annual-cap exception must be investigated rather than automatically declared a slip error. Existing rate coverage remains 2024-2025; no 2026 support was added or implied.

## Remaining coverage gaps

This application does not automate every field, PDF structure or hidden-content check, stored-form/appearance reconciliation, signatures, complete payroll/tax eligibility, all source tie-outs, mixed text/image OCR coverage or human visual inspection. These are explicit remaining capabilities, not checks that passed. Follow the included skill and supply the appropriate records/tools for a comprehensive audit.
