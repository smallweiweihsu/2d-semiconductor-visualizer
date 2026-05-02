# Batch Report

## 1. Summary of what was built

完成 Batch 15B：擴充 Sb₂O₃ / Sb / In interface 與金屬擴散文獻追蹤工作流。

- 擴充 Sb₂O₃、Sb bulk、In、Pd、Ti、Au、Cr、Ni、Pt、Al、Ag、Cu、Sc、WOx 等材料的 literature TODOs。
- 新增可核對的 candidate source records：Sb₂O₃/WSe₂ dielectric、Sb₂O₃ breakdown mechanism、Sb surface oxidation XPS。
- 新增 placeholder sources：Pd/In/Ti/Au into Sb₂O₃ diffusion、Sb₂O₃ leakage/trap behavior、metal deposition damage on Sb₂O₃。
- 新增 candidate evidence：Sb₂O₃ dielectric constant / breakdown / trap behavior、Sb surface oxidation、In/Sb₂O₃ interface buffer、Pd/In/Ti/Au into Sb₂O₃ D0/Ea placeholder evidence。
- 新增 conflict groups：In/Sb₂O₃ buffer effect、metal diffusion into Sb₂O₃、Sb surface oxidation、metal deposition damage on Sb₂O₃。
- 新增 draft recommendations，明確阻擋未驗證 D0/Ea 的定量擴散模型，並保留 In/Sb₂O₃ buffer 為 candidate-only。
- 文獻資料庫 UI 新增「Sb₂O₃ / Sb / In interface 重點」summary card。
- TODO panel 新增快速篩選：高優先、Sb₂O₃、In/Sb₂O₃、金屬擴散、表面氧化、缺 D0/Ea。
- Evidence table 對 null value 顯示「需補參數」標記。
- Recommendation panel 對阻擋定量模型的 draft recommendation 顯示提示。
- Diffusion module 在 Pd/In/Ti/Au → Sb₂O₃ 情境顯示 D0/Ea 文獻缺口提醒。
- Oxidation module 在 Sb/Sb₂O₃ 情境顯示 XPS / AFM 校準提醒。
- Markdown / project export literature warnings 加入關鍵未解缺口。
- 沒有修改 `src/data/materials.ts`，沒有自動 promotion candidate values。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch15b-diffusion-literature-warning.png
screenshots/batch15b-metal-diffusion-evidence.png
screenshots/batch15b-sb2o3-interface-summary.png
src/components/diffusion/DiffusionModelPanel.tsx
src/components/literature/LiteratureDatabaseWorkspace.tsx
src/components/literature/MaterialLiteratureTodoPanel.tsx
src/components/literature/ParameterEvidenceTable.tsx
src/components/literature/ParameterRecommendationPanel.tsx
src/components/oxidation/OxidationModelPanel.tsx
src/components/process/ProcessDiffusionWorkspace.tsx
src/data/literatureSources.ts
src/data/materialLiteratureTodos.ts
src/data/parameterConflictGroups.ts
src/data/parameterEvidence.ts
src/data/parameterRecommendations.ts
src/utils/markdownReport.ts
src/utils/projectExport.ts
```

## 3. src/ file tree

```text
src/
  App.tsx
  components/
    common/
      AcknowledgableNotice.tsx
      CollapsibleSection.tsx
      InfoIcon.tsx
      InfoNotice.tsx
    controls/
      DeviceControlsPlaceholder.tsx
    dashboard/
      ResultPlaceholder.tsx
    device/
      AddLayerPanel.tsx
      DeviceStructureEditor.tsx
      DeviceSummary.tsx
      DeviceTemplateSelector.tsx
      DeviceValidationPanel.tsx
      LayerEditor.tsx
      LayerStackList.tsx
      LayerStackPreview.tsx
      deviceFormatting.ts
      deviceValidation.ts
      layerPlacement.ts
    diffusion/
      DiffusionModelPanel.tsx
      DiffusionParameterEditor.tsx
      DiffusionProfilePlot.tsx
      DiffusionResultSummary.tsx
      DiffusionScenarioSelector.tsx
      DiffusionSchematic.tsx
      DiffusionWarnings.tsx
      diffusionFormatting.ts
    electrical/
      BandAlignmentPreview.tsx
      ElectricalCurvePlot.tsx
      ElectricalModelPanel.tsx
      ElectricalParameterEditor.tsx
      ElectricalResultSummary.tsx
      ElectricalScenarioSelector.tsx
      ElectricalWarnings.tsx
      ElectricalWorkspace.tsx
      electricalFormatting.ts
    export/
      ExportActions.tsx
      ExportWarnings.tsx
      ImportProjectPanel.tsx
      ProjectExportWorkspace.tsx
      ProjectMetadataEditor.tsx
      ReportPreview.tsx
    layout/
      AppShell.tsx
      BottomPanel.tsx
      RightInspector.tsx
      Sidebar.tsx
      TabNavigation.tsx
      TopBar.tsx
      Workspace.tsx
    literature/
      ConflictGroupEditor.tsx
      ConflictGroupPanel.tsx
      LiteratureDatabaseWorkspace.tsx
      LiteratureDetailDrawer.tsx
      LiteratureFilters.tsx
      LiteratureImportExportPanel.tsx
      LiteratureReviewWorkflow.tsx
      LiteratureSourceEditor.tsx
      LiteratureSourceList.tsx
      LiteratureStatusBadge.tsx
      MaterialLiteratureTodoPanel.tsx
      ParameterEvidenceEditor.tsx
      ParameterEvidenceTable.tsx
      ParameterRecommendationPanel.tsx
      literatureFormatting.ts
    materials/
      MaterialCategoryFilter.tsx
      MaterialDatabase.tsx
      MaterialDetail.tsx
      MaterialList.tsx
      ParameterBadge.tsx
      materialStats.ts
    measurements/
      MeasurementColumnMapper.tsx
      MeasurementComparisonPanel.tsx
      MeasurementDataPreview.tsx
      MeasurementDatasetList.tsx
      MeasurementImportPanel.tsx
      MeasurementMetadataEditor.tsx
      MeasurementPlot.tsx
      MeasurementProcessingControls.tsx
      MeasurementProcessingOperationList.tsx
      MeasurementProcessingPanel.tsx
      MeasurementWarnings.tsx
      MeasurementWorkspace.tsx
      PeakMarkerList.tsx
      PeakMarkerPanel.tsx
      ProcessedDataPreview.tsx
      measurementFormatting.ts
    oxidation/
      OxidationModelPanel.tsx
      OxidationParameterEditor.tsx
      OxidationProgressSchematic.tsx
      OxidationResultSummary.tsx
      OxidationScenarioSelector.tsx
      OxidationWarnings.tsx
      OxidationWorkspace.tsx
      RamanInterpretationPanel.tsx
      oxidationFormatting.ts
    plots/
      PlotPlaceholder.tsx
    process/
      ProcessDiffusionWorkspace.tsx
      ProcessFlowEditor.tsx
      ProcessParameterEditor.tsx
      ProcessStepEditor.tsx
      ProcessStepTemplatePicker.tsx
      ProcessSummary.tsx
      ProcessTimeline.tsx
      ProcessValidationPanel.tsx
      processFormatting.ts
      processValidation.ts
    viewer3d/
      Device3DViewer.tsx
      DeviceLayerMesh.tsx
      LayerLabel3D.tsx
      ViewerControls.tsx
      ViewerPlaceholder.tsx
      viewerScaling.ts
      viewerTypes.ts
  data/
    .gitkeep
    defaultProcessFlow.ts
    deviceRoles.ts
    deviceStructures.ts
    diffusionPresets.ts
    electricalPresets.ts
    literatureSources.ts
    materialCategories.ts
    materialLiteratureTodos.ts
    materials.ts
    oxidationPresets.ts
    parameterConflictGroups.ts
    parameterEvidence.ts
    parameterRecommendations.ts
    processStepTypes.ts
    processSteps.ts
    workspaceTabs.ts
  index.css
  main.tsx
  physics/
    bandAlignment.ts
    constants.ts
    diffusion.ts
    electrical.ts
    oxidation.ts
  types/
    device.ts
    diffusion.ts
    electrical.ts
    literature.ts
    material.ts
    measurement.ts
    oxidation.ts
    process.ts
    project.ts
  utils/
    .gitkeep
    markdownReport.ts
    measurementImport.ts
    measurementProcessing.ts
    projectExport.ts
```

## 4. Commands run

```text
git status --short
git branch --show-current
git remote -v
where.exe node
where.exe npm
node -v
npm -v
web searches:
  Sb2O3 dielectric constant thin film breakdown field antimony oxide
  Sb surface oxidation Sb2O3 XPS antimony oxide air exposure
  indium buffer layer oxide interface Sb2O3
  metal diffusion into antimony oxide Sb2O3 palladium indium titanium gold
  "Epitaxially grown single-crystalline antimony trioxide dielectrics for two-dimensional electronics"
  "Dielectric Breakdown Mechanisms in High-k Antimony Trioxide" "10.1021/acsaelm.4c01818"
  "Surface and interface XPS characterization of the oxide layer grown on antimony under UV laser irradiation"
  "palladium diffusion" "antimony oxide"
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe -v
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\typescript\bin\tsc -b
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\eslint\bin\eslint.js .
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\vite\bin\vite.js build
Chrome headless screenshots for Batch 15B UI
git add ...
git commit -m "Batch 15B: Expand Sb2O3 Sb In interface literature tracking"
git rev-parse --short HEAD
git push origin dev
```

Node / npm environment:

- `where node`: `C:\Program Files\WindowsApps\OpenAI.Codex_26.422.9565.0_x64__2p2nqsd0c76g0\app\resources\node.exe`
- `where npm`: not found
- `node -v`: failed with access denied for the WindowsApps Codex node path
- `npm -v`: npm not recognized
- Fallback used: bundled Node runtime
- Bundled Node version: `v24.14.0`

Web access:

- Web access was available.
- Verified candidate source records added from searchable pages/DOIs:
  - Nature Electronics: `https://www.nature.com/articles/s41928-026-01580-w`
  - ACS Applied Electronic Materials DOI: `https://doi.org/10.1021/acsaelm.4c01818`
  - Surface Science DOI: `https://doi.org/10.1016/0039-6028(91)90542-7`
- Topics still TODO: In/Sb₂O₃ buffer effect, Pd/In/Ti/Au D0/Ea into Sb₂O₃, lower-priority metal diffusion values, Sb ambient oxidation rate.

## 5. Build/lint/typecheck result

- `npm install`: not run because npm is unavailable in the Codex shell PATH.
- `npm run typecheck`: fallback equivalent passed via local TypeScript binary.
- `npm run lint`: fallback equivalent passed via local ESLint binary.
- `npm run build`: fallback equivalent passed via local Vite binary.
- Build warning: Vite still reports the known large lazy 3D viewer chunk warning; build succeeded.

## 6. Git commit and push result

- Batch 15B commit hash: `8e68759`
- Current branch: `dev`
- Remote URL: `https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Push result: `8e68759` successfully pushed to `origin/dev`.
- Final report update commit: created after this report update.

## 7. Visible UI description

- 文獻資料庫分頁顯示新的「Sb₂O₃ / Sb / In interface 重點」summary card。
- Summary card 顯示 In/Sb₂O₃ buffer evidence、金屬擴散 evidence、Sb 表面氧化 evidence、Sb₂O₃ dielectric evidence counts。
- TODO panel 顯示快速篩選：高優先、Sb₂O₃、In/Sb₂O₃、金屬擴散、表面氧化、缺 D0/Ea。
- Evidence table 對 null values 顯示「需補參數」，可清楚看出 D0/Ea 仍缺 verified value。
- Conflict groups 顯示 In/Sb₂O₃ buffer effect、metal diffusion into Sb₂O₃、Sb₂O₃ dielectric process dependence、Sb surface oxidation、metal deposition damage。
- Recommendation panel 對阻擋定量模型的 draft recommendation 顯示「阻擋定量模型」。
- Diffusion tab 在 Pd/In/Ti/Au → Sb₂O₃ 情境顯示 D0/Ea 文獻缺口提醒。
- Oxidation tab 在 Sb/Sb₂O₃ 情境顯示 XPS / AFM 校準提醒。

## 8. Warnings or limitations

- 沒有自動 promotion 到 `materials.ts`。
- 沒有 verified source 或 verified parameter。
- In/Sb₂O₃ buffer effect 仍未驗證，不可視為結論。
- Pd/In/Ti/Au into Sb₂O₃ 的 D0/Ea 仍為 placeholder/null，擴散模型不可定量。
- Sb surface oxidation rate 仍缺 ambient/process-calibrated value。
- Sb₂O₃ dielectric properties 仍需依相、厚度、缺陷、氧空缺、沉積方法與電極條件分開整理。
- 沒有 DOI lookup automation、PDF parsing、backend database 或 cloud sync。

## 9. Next recommended batch

Batch 15C: metal contact and diffusion candidate tracking for Ti, Au, Cr, Ni, Pt, Al, Ag, Cu, Sc and WSe₂ contact behavior.

Screenshots:

```text
screenshots/batch15b-sb2o3-interface-summary.png
screenshots/batch15b-metal-diffusion-evidence.png
screenshots/batch15b-diffusion-literature-warning.png
```
