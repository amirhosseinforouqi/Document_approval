# Exhaustive audit protocol

## Parameters and defaults

Resolve these from the request and documents; do not turn them into a mandatory questionnaire. Record unknowns explicitly and continue independent checks. Ask only for missing information that materially prevents a conclusion.

| Parameter | Default / handling |
| --- | --- |
| Scope | All supplied files, pages, repeated copies and applicable format objects; no sampling unless the user explicitly narrows scope |
| Audit depth | Exhaustive; aggressive means actively searching for counterevidence, not inventing faults |
| Domain and jurisdiction | Detect from contents; confirm ambiguity before applying jurisdiction-specific rules |
| Period and effective date | Per document and transaction; distinguish tax year, fiscal year, pay period and issue date |
| Entity and ownership | Map from supplied evidence; unresolved identity conflicts block only affected conclusions |
| Source precedence | Record original/amended/superseded status and purpose; no universal rule that newest always wins |
| Currency, units and locale | Record per field/table; do not combine currencies or confuse monthly/annual, gross/net, thousands/units |
| Financial precision | Exact decimal/integer cents; rule-specific rounding and permitted tolerance only |
| Layout reference and tolerance | User specification or authoritative template; otherwise measured peer consistency and visible impact |
| Render settings | Record renderer, resolution, page dimensions, rotation, substitutions and limitations |
| Calculation environment | Record calculation engine/tool, version if available, inputs and reproducible expressions |
| External verification | Official sources for applicable periods; no private data in public searches; unavailable authority means unverified rule |
| Correction mode | Review only unless user authorizes edits; corrections go to copies and require re-audit |
| Output | Concise report plus complete field/check ledger and reproducible calculations where applicable |

## Review passes

1. **Inventory and applicability:** Create the file/page/object inventory. Derive checks from each actual document, schema and applicable official instructions. Assign a stable check ID; do not rely solely on a generic checklist.
2. **Structure and extraction:** Inspect the applicable format internals and extract all content, including hidden/revision content. Log extraction failures and confirm critical values against rendered evidence.
3. **Field review:** Cover every populated field, relevant blank, label, code, note and repeated copy. For narrative files, review every paragraph/list item and material factual assertion; use table cell, sheet/cell, slide/object or section anchors where page numbers do not exist.
4. **Independent calculation:** Reproduce determinable arithmetic from the lowest-level available inputs. Check dimensions, sign, order of operations, inclusive/exclusive date boundaries, leap years, proration, threshold edges, rate-change dates and cap crossings where applicable. If withholding depends on history, do not substitute annual totals for per-pay calculations.
5. **Rules and eligibility:** Verify edition and effective date, qualifying conditions, exclusions, interaction of credits/deductions, required attachments and requested signatures. An unsigned draft is not automatically defective; assess intended use.
6. **Reconciliation:** Trace each source-to-destination transfer forward and each reported result backward. Check control totals, missing/duplicate entries, period gaps/overlaps, opening-to-closing balances, multiple entities and mixed versions. Matching copied errors do not pass independent verification.
7. **Language and semantics:** Check spelling, punctuation, names against sources, dates, numbering, cross-references, definitions, units, legends and footnotes. Check contradictory statements and totals described inaccurately in prose. Proper names, abbreviations and legal text require evidence before correction.
8. **Visual and alignment:** Run the applicable format and geometry checks in file-structure-and-layout.md on every rendered page and region. An extraction pass cannot substitute for this pass.
9. **Challenge pass:** Revisit each provisional substantive pass using a different check where possible: inverse calculation, independent control total, raw source tie-out, boundary condition or rendered comparison. Focus on all reported discrepancies and high-impact fields; do not merely rerun the same formula and call it independent. Record the method or why no independent method is available.
10. **Coverage and reporting:** Reconcile inventory with the ledger, consolidate root causes and downstream impacts, and list every failed, blocked or unperformed check. No clean overall conclusion while material checks are unresolved.

For large jobs, work in batches with a persistent ledger and resume from recorded positions. Do not reduce exhaustive scope silently or stop after a sample. If a tool or turn limit prevents finishing, state completed and outstanding counts and exact resume points.

## Ledger and coverage requirements

Maintain one machine-readable CSV/JSON ledger or an equivalent table. Escape spreadsheet-export text safely so formula-like source values are not executed. Use masked representations of sensitive identifiers in deliverables; record comparisons without publishing full identifiers.

Each entry records: check ID; file ID/version; entity/period; page or object anchor; field/region; audit dimension; observed value; expected value or relationship; source and source location; formula/method; difference with unit; rule URL/effective period where applicable; evidence/crop reference; execution state; finding status; severity; root-cause ID; downstream affected fields; limitation; next action.

Keep **execution state** separate from **finding status**:

- Completed: The defined check actually ran to a supported conclusion.
- Blocked: A named evidence/tool/input gap prevents completion.
- Not performed: The check is applicable but has not run, with the reason and remaining work recorded.
- Not applicable: Record why it does not apply; this is not a pass.

Use the SKILL.md finding statuses only for the conclusions they support. A field can be arithmetically verified, visually defective and externally unverified at the same time; keep separate checks. If only part of a check ran, split it into completed and blocked/not-performed checks.

Report counts for supplied/reviewed/unreadable/unreviewed pages or equivalent objects, identified/applicable/completed/blocked/not-performed checks, and confirmed findings by severity. State denominator definitions. A discovered check count does not prove every relevant check was identified. Do not invent a numerical confidence or overall accuracy score.

## Decision and correction rules

- A hard discrepancy requires reproducible evidence. A plausible anomaly remains needs confirmation. Aggressive review must preserve this distinction.
- Separate financial materiality from presentation impact. A 0.01 mismatch may be a real error; a large difference may be explained by different periods. Do not dismiss an unexplained difference solely because it is small.
- Escalate layout to major/critical when it conceals a sign/digit, associates a value with the wrong person/row/year, omits required content or prevents reliable use. Ordinary cosmetic inconsistency is minor.
- Do not infer authenticity, fraud, identity or official acceptance from formatting, metadata, signatures drawn as images or matching figures. State exactly which checks support the concern.
- Report the earliest demonstrated root cause and all affected results. Do not sum overlapping downstream differences into a misleading total impact.
- If corrections are authorized, preserve originals, record before/after changes, rerun affected formulas, transfers and cross-document comparisons, then re-render every changed page plus adjacent pages affected by reflow. Verify no unrelated content changed. A corrected file is not verified until these checks run.

## Completion test

Before finalizing, ask: Did every inventoried object receive coverage? Were non-visible contents considered? Were displayed values checked against extraction/storage? Were calculations independently reproduced? Were rule eligibility and dates verified? Were amounts and labels visually matched? Were all required comparisons and challenge checks performed or explicitly blocked? Does every finding have a location and evidence? Does every unverified conclusion name the missing input? Does the report accurately separate completed review from unresolved assurance?

Use an outcome such as **Confirmed errors found**, **No confirmed errors found in completed checks; unresolved checks remain**, or **No errors found in the completed applicable audit**. The last outcome requires all applicable checks completed and no unresolved material limitations, and still does not guarantee authenticity or perfect accuracy.
