# Batch Report

## 1. Summary of what was built

完成 Batch 15A：加入第一批由使用者指定、具 DOI 的文獻種子資料與候選參數證據。

- 新增 WSe₂ PL / Raman、band gap / electrical properties、WSe₂ surface oxidation / WOx、Sb₂O₃ high-k / breakdown、WSe₂ contact / Fermi-level pinning 相關 candidate source records。
- 新增 WSe₂、Sb₂O₃、Pd/WSe₂、In/Sb₂O₃ 相關 parameter evidence records，並保留 condition、method、applicability 與 warnings。
- 新增/更新 conflict groups，明確標示 WSe₂ band gap、WSe₂ oxidation/Raman visibility、Sb₂O₃ dielectric properties、Pd/WSe₂ contact 與 In/Sb₂O₃ buffer effect 皆具條件依賴或待審核限制。
- 新增 draft parameter recommendations；全部維持 `draft`，沒有標記 `ready_to_promote`，也沒有寫入正式 `materials.ts`。
- 文獻資料庫 UI 新增「第一批文獻種子資料」摘要，可顯示真實來源數、placeholder 數、candidate evidence、reviewed 與 verified 數量。
- TODO list 新增「已有候選證據」篩選，並在待查項目卡片顯示 matching candidate evidence count。
- Evidence table 新增來源篩選：全部來源、只看真實來源、只看 placeholder。
- Markdown report 的文獻摘要新增真實來源數、placeholder 數、review status、材料證據分布與 recommendation count。
- README 新增 Batch 15A 說明。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch15a-evidence-table.png
screenshots/batch15a-literature-seed-summary.png
screenshots/batch15a-material-literature-detail.png
src/components/literature/LiteratureDatabaseWorkspace.tsx
src/components/literature/MaterialLiteratureTodoPanel.tsx
src/data/literatureSources.ts
src/data/parameterConflictGroups.ts
src/data/parameterEvidence.ts
src/data/parameterRecommendations.ts
src/utils/markdownReport.ts
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
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe -v
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\typescript\bin\tsc -b
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\eslint\bin\eslint.js .
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\vite\bin\vite.js build
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:5174/
Chrome headless screenshots for Batch 15A UI
git add ...
git commit -m "Batch 15A: Add first curated literature seed pack"
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

## 5. Build/lint/typecheck result

- `npm install`: not run because npm is unavailable in the Codex shell PATH.
- `npm run typecheck`: fallback equivalent passed via local TypeScript binary.
- `npm run lint`: fallback equivalent passed via local ESLint binary.
- `npm run build`: fallback equivalent passed via local Vite binary.
- Build warning: Vite still reports the known large lazy 3D viewer chunk warning; build succeeded.

## 6. Git commit and push result

- Batch 15A implementation commit hash: `9929c7c`
- Current branch: `dev`
- Remote URL: `https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Push result: `9929c7c` successfully pushed to `origin/dev`.
- Final report update commit: created after this implementation report update.

## 7. Visible UI description

- 「文獻資料庫」分頁頂部新增「第一批文獻種子資料」摘要，顯示真實來源、placeholder、candidate evidence、reviewed 與 verified 數量。
- 「文獻來源」清單包含 DOI-backed candidate source records，例如 WSe₂ PL/Raman、WSe₂ oxidation、Sb₂O₃ high-k、Sb₂O₃ breakdown 與 WSe₂ contacts。
- 「參數證據」表格可看到 WSe₂ band gap、WSe₂ oxidation / WOx、Sb₂O₃ band gap / dielectric / breakdown、Pd/WSe₂ contact 與 In/Sb₂O₃ placeholder evidence。
- Evidence table 新增「全部來源 / 只看真實來源 / 只看 placeholder」篩選。
- TODO list 可用「已有候選證據」篩選，並顯示每個待查項目的 candidate evidence count。
- Conflict groups 顯示 WSe₂ band gap layer/method dependence、WSe₂ oxidation Raman visibility、Sb₂O₃ dielectric process dependence、Pd/WSe₂ contact uncertainty 與 In/Sb₂O₃ buffer unverified 等 condition-dependent summaries。
- Recommendation panel 顯示 draft recommendations；沒有任何 recommendation 被標記為 ready to promote。
- Material Detail 的文獻來源摘要會反映 WSe₂、Sb₂O₃、Pd、In、WOx 相關 evidence / conflict / recommendation counts，並保留「正式材料資料庫未自動更新」的界線。

## 8. Warnings or limitations

- 本批沒有執行 web search automation；所有新增真實 source records 都來自使用者明確提供的文獻資訊。
- 沒有新增或修改正式 `materials.ts` 參數值。
- 沒有將 candidate evidence 自動 promotion 到 official material database。
- 不完整作者欄位保留為使用者提供的最小資訊，並在 notes 中標記後續需補齊。
- In/Sb₂O₃ buffer effect 仍是 placeholder / TODO，不代表已驗證。
- Sb₂O₃ dielectric / breakdown、WSe₂ oxidation rate、Pd/WSe₂ contact resistance 等仍需要人工審核與實驗條件比對。
- Edge headless 與 in-app browser 截圖路徑不可用；已改用 Chrome headless 成功產生截圖。

## 9. Next recommended batch

Batch 15B: expand curated literature data for Sb₂O₃ / Sb / In interface and metal diffusion into Sb₂O₃.

Screenshots:

```text
screenshots/batch15a-literature-seed-summary.png
screenshots/batch15a-evidence-table.png
screenshots/batch15a-material-literature-detail.png
```
