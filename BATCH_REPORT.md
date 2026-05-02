# Batch Report

## 1. Summary of what was built

完成 Batch 14：建立第一版實用的文獻資料輸入、審核、比較與匯入 / 匯出工作流。

- 新增 literature source editor，可建立/編輯候選來源、作者、年份、來源類型、DOI、URL、review status、tags 與 notes。
- 新增 parameter evidence editor，可輸入 source、materials、parameter key、value、unit、condition、method、agreement status、confidence、summary、applicability 與 warnings。
- 新增 conflict group editor，可整理 evidence IDs、agreement counts、summary、recommended status 與候選 recommended value。
- 新增 recommendation workflow，可從 conflict group 建立 draft recommendation，並標示 reviewed、ready to promote 或 rejected。
- 新增 Material Literature TODO dataset，涵蓋 WSe₂、Sb₂O₃、Sb bulk、Pd、In、WOx 與其他目標材料的高/中/低優先待查項目。
- 文獻資料庫分頁改為 internal sections：待查清單、文獻來源、參數證據、衝突 / 共識、推薦參數、匯入 / 匯出。
- 新增 literature database JSON 匯入 / 匯出，以及 TODO list / evidence summary Markdown 匯出。
- Material Detail 文獻來源區升級，顯示 TODO、evidence、conflict group、recommendation counts，並分區收合。
- Project JSON / Markdown report 可包含 literature database、todos、recommendations 摘要。
- Export warnings、measurement warnings、process validation panel 改為可收合區塊，延續 UI decluttering。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch14-literature-todo-list.png
screenshots/batch14-parameter-evidence-editor.png
screenshots/batch14-recommendation-panel.png
src/components/export/ExportWarnings.tsx
src/components/export/ProjectExportWorkspace.tsx
src/components/literature/ConflictGroupEditor.tsx
src/components/literature/LiteratureDatabaseWorkspace.tsx
src/components/literature/LiteratureImportExportPanel.tsx
src/components/literature/LiteratureReviewWorkflow.tsx
src/components/literature/LiteratureSourceEditor.tsx
src/components/literature/MaterialLiteratureTodoPanel.tsx
src/components/literature/ParameterEvidenceEditor.tsx
src/components/literature/ParameterRecommendationPanel.tsx
src/components/literature/literatureFormatting.ts
src/components/materials/MaterialDetail.tsx
src/components/measurements/MeasurementWarnings.tsx
src/components/process/ProcessValidationPanel.tsx
src/data/materialLiteratureTodos.ts
src/data/parameterRecommendations.ts
src/types/literature.ts
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
msedge --headless=new --no-sandbox --disable-gpu --window-size=1600,1200 --screenshot=...
git add .
git commit -m "Batch 14: Add literature review workflow"
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

- Batch 14 commit hash: `81f6d21`
- Current branch: `dev`
- Remote URL: `https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Push result: origin/dev push completed for Batch 14 implementation and final report update.

## 7. Visible UI description

- 文獻資料庫分頁現在有內部分頁：待查清單、文獻來源、參數證據、衝突 / 共識、推薦參數、匯入 / 匯出。
- 待查清單可依 priority、material、parameter、status 與 search text 篩選，並可標示 in progress、candidate found、reviewed、verified。
- 待查項目可一鍵切到 parameter evidence editor，預填 material 與 parameter key。
- Source editor 可新增/儲存候選文獻來源、複製 source ID，並以 review workflow 切換 candidate/reviewed/verified/rejected。
- Parameter evidence editor 支援多材料、null value、qualitative claim、agreement status、confidence、condition、method、summary、applicability 與 warnings。
- Conflict group editor 可選 evidence IDs，顯示 supports/contradicts/condition-dependent/unclear/not-applicable counts。
- Recommendation panel 可從 conflict group 建立 draft recommendation，標記 reviewed / ready to promote / rejected，並複製推薦摘要。
- Import/export panel 可匯出 literature database JSON、TODO Markdown、evidence summary Markdown，也可貼上 JSON 匯入。
- Material Detail 文獻來源區顯示 TODO/evidence/conflict/recommendation counts，細節預設收合，避免重新變擁擠。
- Project export report 的文獻摘要包含 sources/evidence/todos/recommendations/conflict group counts。

Screenshots:

```text
screenshots/batch14-literature-todo-list.png
screenshots/batch14-parameter-evidence-editor.png
screenshots/batch14-recommendation-panel.png
```

## 8. Warnings or limitations

- 本批沒有 automatic web search、DOI lookup、PDF parsing 或 literature automation。
- 所有 seed TODO / placeholder records 都不是正式文獻引用，也不是 verified material parameters。
- Candidate evidence 不會自動寫入 `materials.ts`；recommendation 也只是待人工審核的候選摘要。
- Literature workspace 的新增/編輯狀態目前是瀏覽器 session state；可用本批新增的 literature JSON 匯出保存。
- Project export currently includes the seeded literature database snapshot;跨頁即時文獻編輯狀態尚未提升成全域 app state。
- Normal npm 仍不可用，本批使用 bundled Node fallback 完成 typecheck、lint、build。

## 9. Next recommended batch

Batch 15: first real curated literature entry batch for WSe₂, Sb₂O₃, Sb, Pd, In, and WOx.
