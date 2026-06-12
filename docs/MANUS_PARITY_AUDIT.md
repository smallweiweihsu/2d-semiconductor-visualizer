# Manus Parity Audit

Audit date: 2026-06-13

Reference: https://semiviz2d-cfdeom2b.manus.space

Compared implementation: https://2d-semiconductor-visualizer.vercel.app before Batch 6.5, then local Batch 6.5 implementation.

Screenshot artifacts:

- `test-artifacts/manus-dashboard.png` and `test-artifacts/current-dashboard.png`
- `test-artifacts/manus-device-builder.png` and `test-artifacts/current-device-builder.png`
- `test-artifacts/manus-process-flow.png` and `test-artifacts/current-process-flow.png`
- `test-artifacts/manus-iv-simulator.png` and `test-artifacts/current-iv-simulator.png`
- `test-artifacts/manus-band-diagram.png` and `test-artifacts/current-band-diagram.png`
- `test-artifacts/manus-materials.png` and `test-artifacts/current-materials.png`
- `test-artifacts/manus-references.png` and `test-artifacts/current-references.png`
- `test-artifacts/manus-measurements.png` and `test-artifacts/current-measurements.png`
- `test-artifacts/manus-comparison-lab.png` and `test-artifacts/current-comparison-lab.png`
- `test-artifacts/manus-research-notes.png` and `test-artifacts/current-research-notes.png`

## Shared Findings

- Manus uses a dark scientific workspace shell with a fixed sidebar, compact topbar, dense cards, cyan active states, muted dividers, and mono numeric values.
- The current app already matches the shell, navigation labels, import/export controls, local project reset, and many colors.
- The biggest gaps were route information architecture: several routes had the right data but presented it as generic editor grids or placeholders instead of Manus list/detail workspaces.
- Batch 6.5 adds shared primitives: split/detail layout, list rows, detail headers, status badges, score dots, parameter tables, metadata grids, callouts, preview cards, and chip selectors.

## `/` Dashboard

Priority: P1

Manus layout summary: compact hero with semiconductor render, two CTAs, stat cards, active device card, missing-parameter warning card, and lower project cards.

Current layout summary: dashboard was already close after earlier batches, with matching shell, hero asset, stats, active device, and warnings.

Differences: fine spacing and image crop still differ slightly; current topbar has extra JSON/export/reset actions compared with Manus.

Missing components: none P0.

Wrong spacing / typography / card structure: small differences in vertical rhythm and control density.

Wrong interaction: current app includes extra persistence controls that Manus did not emphasize.

Implementation tasks: keep existing dashboard, avoid large changes, keep project controls.

Status: retained with minor parity expectations; no functional regression intended.

## `/device-builder`

Priority: P1

Manus layout summary: three-column builder with layer list, large rendered device viewport, and selected layer inspector.

Current layout summary: already has editable active device, layer list, interactive lazy React Three Fiber viewport, view modes, and property editor.

Differences: current viewport has more advanced controls than Manus; Batch 6.4 moved debug labels/grid/axes behind display mode, but visual shader is still not pixel-identical.

Missing components: no missing P0 component; screenshot QA remains important.

Wrong spacing / typography / card structure: advanced controls can feel denser than Manus.

Wrong interaction: none; current app intentionally keeps selection, persistence, simulation config, and 3D orbit controls.

Implementation tasks: keep 3D viewport intact and ensure smoke still validates canvas, selection sync, labels, axes, and refresh persistence.

Status: preserved existing Batch 6.2-6.4 work.

## `/process-flow`

Priority: P0 before Batch 6.5, P1 after Batch 6.5

Manus layout summary: left process step timeline/list, right selected step detail with status and expected result.

Current layout summary: had two cards but lacked Manus-style list row density, metadata, status badge, and callout structure.

Differences: timeline was functional but visually generic.

Missing components: selected step metadata panel and risk/expected-result callouts.

Wrong spacing / typography / card structure: card internals were too sparse and did not match list/detail rhythm.

Wrong interaction: selected step worked, but detail did not expose enough process parameters.

Implementation tasks: convert to `process-timeline` + `process-detail`, use list rows, metadata grid, callouts, and status badge.

Status: implemented.

## `/iv-simulator`

Priority: P1

Manus layout summary: card-based simulator with active device summary, extracted parameters, warnings, charts, and model controls.

Current layout summary: functionally richer than Manus because it includes local project extraction, correctness status, fallback gating, overlay selector, and MOSFET curves.

Differences: controls are more extensive; overlay selector adds UI that Manus did not show.

Missing components: none P0.

Wrong spacing / typography / card structure: advanced controls remain visible rather than fully collapsed.

Wrong interaction: none; current additions are required by Batch 3-7.

Implementation tasks: retain functionality, keep chart/card style, do not regress fallback status or measurement overlay.

Status: preserved; smoke covers overlay and fallback flows.

## `/band-diagram`

Priority: P0

Manus layout summary: left material selector, central energy band diagram preview, right Schottky barrier and parameter summary. Includes before/after contact mode.

Current layout summary: before Batch 6.5 it was a placeholder grid with four static material text cards.

Differences: missing nearly all Manus structure.

Missing components: metal selector, semiconductor selector, before/after toggle, diagram canvas/card, barrier summary, caution note.

Wrong spacing / typography / card structure: placeholder cards had no sidebar/detail composition.

Wrong interaction: no material or mode selection.

Implementation tasks: build a three-column band workspace with selectors, SVG energy diagram, parameter table, mode toggle, and warning callout.

Status: implemented.

## `/materials`

Priority: P0

Manus layout summary: left material list with search and category badges, right material detail header, parameter cards with confidence indicators, Raman/notes sections.

Current layout summary: before Batch 6.5 it opened directly into an editor-heavy form and parameter editor.

Differences: too much form UI in the default view; missing read-first parameter cards.

Missing components: detail header, material monogram, parameter card grid, Raman-style panel, notes panel.

Wrong spacing / typography / card structure: form fields dominated the first viewport.

Wrong interaction: editing worked, but read/review workflow was not Manus-like.

Implementation tasks: make default view read/detail first and keep editor in a secondary section.

Status: implemented; editor remains available for provenance workflows.

## `/references`

Priority: P0

Manus layout summary: left literature list, right review/detail view with status, metadata, reliability score, linked usage, and notes.

Current layout summary: before Batch 6.5 it showed a generic list plus editor form.

Differences: detail page looked like an admin editor, not a paper review workspace.

Missing components: review header, status badge, score dots, DOI/URL metadata, usage summary.

Wrong spacing / typography / card structure: generic form layout did not match Manus.

Wrong interaction: Add/Edit existed, but was too prominent.

Implementation tasks: move edit form into secondary section and make review detail the default.

Status: implemented.

## `/measurements`

Priority: P0

Manus layout summary: left dataset list, right dataset detail with date/operator/tool metadata, preview/chart, notes, metrics.

Current layout summary: before Batch 6.5 it was a CSV import dashboard with datasets, chart, metrics, and raw table arranged in independent cards.

Differences: import UI dominated; dataset list/detail relationship was weaker.

Missing components: selected dataset detail header, metadata grid, Manus-style visual preview area.

Wrong spacing / typography / card structure: too many equal-weight cards, no clear selected dataset.

Wrong interaction: import worked, but saved dataset did not become the center of the route.

Implementation tasks: convert to split/detail; keep CSV import in secondary section; keep charts, metrics, raw table, and persistence.

Status: implemented.

## `/comparison-lab`

Priority: P0

Manus layout summary: material chips with selected/unselected states, large parameter comparison table, confidence dots/badges, category badges.

Current layout summary: before Batch 6.5 it showed only four material rows in one card.

Differences: missing the comparison table and interactive chips.

Missing components: chip selector, parameter rows, confidence markers, category row, legend.

Wrong spacing / typography / card structure: single sparse card did not match Manus density.

Wrong interaction: no selectable material chips.

Implementation tasks: add `ManusChipSelector`, parameter comparison table, confidence badges, and legend.

Status: implemented.

## `/research-notes`

Priority: P1

Manus layout summary: left hypothesis list, right selected hypothesis detail with status badge, linked materials/references, description/evidence structure.

Current layout summary: already similar, but used bespoke CSS and lacked shared split/detail primitives.

Differences: status and linked panels were lighter than Manus; not aligned with other list/detail routes.

Missing components: shared split/detail layout and stronger status badge/evidence card.

Wrong spacing / typography / card structure: bespoke layout had inconsistent padding with other pages.

Wrong interaction: selection worked.

Implementation tasks: convert to `ManusSplitDetail`, keep selected hypothesis interaction, add status badge and evidence callout.

Status: implemented.

## Remaining Differences

- The interactive 3D viewport is visually close to the reference direction but is not a pixel-identical shader/camera clone of Manus.
- Some controls intentionally remain because later batches require them: JSON import/export, Reset local project, localStorage migration, CSV import, measurement overlay, simulation fallback status, and material provenance editing.
- Manus has a "Made with Manus" badge on hosted reference pages; this app intentionally does not recreate that badge.
- Exact typography metrics and chart curve shapes may differ because the local app now uses real project data and simulation inputs instead of only static demonstration data.
