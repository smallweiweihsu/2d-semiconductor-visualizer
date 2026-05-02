# Batch Report

## 1. Summary of what was built

完成 Batch 13：新增文獻候選資料庫基礎、材料參數來源追蹤、文獻衝突 / 共識整理，以及第一版 UI 資訊架構重整。

- 新增「文獻資料庫」分頁，集中管理候選文獻來源、參數證據與 conflict groups。
- 新增 literature type system，包含 review status、agreement status、source type、material parameter key、parameter evidence 與 conflict group。
- 新增 placeholder / seed 文獻候選資料，全部標示為 `candidate`，不包含未驗證 DOI 或可信材料參數。
- Material Detail 新增可收合「文獻來源」區，顯示該材料相關 evidence、candidate/reviewed/verified counts 與 conflict summaries。
- 新增共用 `InfoIcon`、`InfoNotice`、`CollapsibleSection`、`AcknowledgableNotice` 元件。
- 將元件結構、材料資料庫、擴散估算、氧化模擬與電性分析中的重要限制說明改為較精簡、可展開、可標示已讀的 notice。
- 改善新增材料層後的回饋：自動選取新 layer、在 layer stack list 高亮、顯示放置方式與快速對齊 / 移動動作。
- JSON / Markdown 匯出整合 literature database summary。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch13-add-layer-feedback.png
screenshots/batch13-decluttered-materials.png
screenshots/batch13-literature-database.png
src/components/common/AcknowledgableNotice.tsx
src/components/common/CollapsibleSection.tsx
src/components/common/InfoIcon.tsx
src/components/common/InfoNotice.tsx
src/components/device/DeviceStructureEditor.tsx
src/components/device/LayerStackList.tsx
src/components/diffusion/DiffusionModelPanel.tsx
src/components/electrical/ElectricalModelPanel.tsx
src/components/export/ProjectExportWorkspace.tsx
src/components/layout/Workspace.tsx
src/components/literature/ConflictGroupPanel.tsx
src/components/literature/LiteratureDatabaseWorkspace.tsx
src/components/literature/LiteratureDetailDrawer.tsx
src/components/literature/LiteratureFilters.tsx
src/components/literature/LiteratureSourceList.tsx
src/components/literature/LiteratureStatusBadge.tsx
src/components/literature/ParameterEvidenceTable.tsx
src/components/literature/literatureFormatting.ts
src/components/materials/MaterialDatabase.tsx
src/components/materials/MaterialDetail.tsx
src/components/oxidation/OxidationModelPanel.tsx
src/data/literatureSources.ts
src/data/parameterConflictGroups.ts
src/data/parameterEvidence.ts
src/data/workspaceTabs.ts
src/types/literature.ts
src/types/project.ts
src/utils/markdownReport.ts
src/utils/projectExport.ts
```

## 3. src/ file tree

```text
src/
  App.tsx
  index.css
  main.tsx
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
      ConflictGroupPanel.tsx
      LiteratureDatabaseWorkspace.tsx
      LiteratureDetailDrawer.tsx
      LiteratureFilters.tsx
      LiteratureSourceList.tsx
      LiteratureStatusBadge.tsx
      ParameterEvidenceTable.tsx
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
    materials.ts
    oxidationPresets.ts
    parameterConflictGroups.ts
    parameterEvidence.ts
    processStepTypes.ts
    processSteps.ts
    workspaceTabs.ts
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
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\typescript\bin\tsc -b
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\eslint\bin\eslint.js .
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\vite\bin\vite.js build
Invoke-WebRequest http://127.0.0.1:5174/
msedge --headless=new --disable-gpu --window-size=1600,1200 --screenshot=...
git add .
git commit -m "Batch 13: Add literature database and declutter UI"
git rev-parse --short HEAD
```

Node / npm environment:

```text
where node:
C:\Program Files\WindowsApps\OpenAI.Codex_26.422.9565.0_x64__2p2nqsd0c76g0\app\resources\node.exe

where npm:
INFO: Could not find files for the given pattern(s).

node -v:
failed, access denied for WindowsApps Codex node.exe

npm -v:
failed, npm command not found

Verification mode:
normal npm unavailable; used bundled Node fallback with local TypeScript, ESLint, and Vite binaries.
```

## 5. Build/lint/typecheck result

- Typecheck: passed via bundled Node fallback.
- Lint: passed via bundled Node fallback.
- Build: passed via bundled Node fallback.
- Build warning: Vite still reports the known lazy 3D viewer chunk-size warning; build completed successfully.

## 6. Git commit and push result

- Batch 13 implementation commit hash: `4665655`
- Current branch: `dev`
- Remote URL: `https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Push result: origin/dev push completed for Batch 13 implementation and final report update.

## 7. Visible UI description

- 新增「文獻資料庫」分頁，包含 compact intro notice、filters、文獻來源、參數證據與衝突 / 共識整理。
- 文獻來源列表顯示 title、year、source type、review status 與 tags。
- 參數證據表格顯示 material、parameter、value、condition、method、source、agreement status 與 confidence。
- 衝突整理 panel 顯示 material、parameter、summary、evidence count、supports / contradicts / condition-dependent counts 與 recommendation status。
- 點選 source / evidence / conflict 後，右側 detail area 顯示詳細資訊。
- Material Detail 新增 collapsed「文獻來源」區，顯示 related evidence、candidate / reviewed / verified counts 與 conflict summaries。
- 元件結構、材料資料庫、擴散、氧化、電性分析的主要限制提醒改為較精簡的可展開 notice，並可標示已讀。
- 新增材料層後，layer stack list 會高亮新 layer，中間會顯示新增成功訊息與快速動作：靠左、置中、靠右、符合參考層、移到上方、移到下方。

Screenshots:

```text
screenshots/batch13-literature-database.png
screenshots/batch13-decluttered-materials.png
screenshots/batch13-add-layer-feedback.png
```

## 8. Warnings or limitations

- 本批只建立 literature candidate database foundation，沒有自動 web search、DOI lookup、PDF parsing 或 literature automation。
- 目前 seed records 都是 placeholder / candidate，不可視為真實引用或正式材料參數。
- 沒有自動 parameter promotion；材料資料庫正式參數仍需人工審核。
- Acknowledged notice state 使用 localStorage，尚未納入全域同步或後端保存。
- Add-layer feedback 可以高亮與提供 quick actions；更完整的互動式幾何編輯仍留待後續批次。
- Normal npm 仍不可用，本批使用 bundled Node fallback 完成 typecheck、lint、build。

## 9. Next recommended batch

Batch 14: verified literature data entry workflow and first curated material parameter set.
