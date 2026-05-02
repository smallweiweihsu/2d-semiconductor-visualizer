# Batch Report

## 1. Summary of what was built

完成 Batch 12：新增第一版量測資料基本處理工具，支援非破壞式 processing pipeline、處理後資料集、peak markers、raw vs processed 視覺化，以及 JSON / Markdown 匯出整合。

- 新增 measurement processing 型別：`ProcessingOperation`、`ProcessedMeasurementDataset`、`PeakMarker`、`MeasurementProcessingState`。
- 新增純函式處理工具：`abs(Y)`、`Y 取負號`、最大值正規化、Min-Max 正規化、面積正規化、常數 baseline、線性 baseline、local maximum peak suggestion。
- 新增資料處理面板，可選 source dataset、x/y 欄位、加入 operation、調整 operation 參數、啟用 / 停用 / 移除 / 排序 operation。
- 新增電性 abs(I) helper 與光譜正規化 helper，並顯示資料處理的科學限制。
- 新增處理後資料預覽，不覆蓋原始資料。
- 新增手動 peak marker 與自動 peak suggestion panel。
- 更新 SVG plot，可疊加原始資料與處理後資料，並以垂直標線顯示 peak markers。
- 更新量測比較提醒，說明不同處理流程不可直接比較。
- JSON 匯出整合 raw datasets、processed datasets、peak markers 與 comparisons。
- Markdown 報告新增「量測資料處理摘要」，列出 source dataset、處理步驟、警告與 peak marker table。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch12-electrical-abs-current.png
screenshots/batch12-measurement-processing.png
screenshots/batch12-peak-markers.png
src/components/export/ProjectExportWorkspace.tsx
src/components/layout/AppShell.tsx
src/components/layout/Workspace.tsx
src/components/measurements/MeasurementComparisonPanel.tsx
src/components/measurements/MeasurementPlot.tsx
src/components/measurements/MeasurementProcessingControls.tsx
src/components/measurements/MeasurementProcessingOperationList.tsx
src/components/measurements/MeasurementProcessingPanel.tsx
src/components/measurements/MeasurementWorkspace.tsx
src/components/measurements/PeakMarkerList.tsx
src/components/measurements/PeakMarkerPanel.tsx
src/components/measurements/ProcessedDataPreview.tsx
src/types/measurement.ts
src/types/project.ts
src/utils/markdownReport.ts
src/utils/measurementProcessing.ts
src/utils/projectExport.ts
```

## 3. src/ file tree

```text
src/
  App.tsx
  index.css
  main.tsx
  components/
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
    materialCategories.ts
    materials.ts
    oxidationPresets.ts
    processSteps.ts
    processStepTypes.ts
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
tree src /F
Microsoft Edge headless screenshots for #measurements
git add ...
git commit -m "Batch 12: Add measurement data processing tools"
git commit -m "Batch 12: Final report update"
git push origin dev
```

## 5. Build/lint/typecheck result

- `where node`：`C:\Program Files\WindowsApps\OpenAI.Codex_26.422.9565.0_x64__2p2nqsd0c76g0\app\resources\node.exe`
- `where npm`：找不到符合項目。
- `node -v`：失敗，系統 PATH 指向 Codex app / WindowsApps 內的 `node.exe`，執行時出現「存取被拒」。
- `npm -v`：失敗，`npm` 仍不在 PowerShell PATH。
- Normal npm：未使用，因為 npm 無法存取。
- Fallback used：使用 `C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe` 直接執行 local project binaries。
- Fallback Node version：`v24.14.0`。
- TypeScript：通過。
- ESLint：通過。
- Vite build：通過。
- Build warning：仍有既有的 3D viewer lazy chunk 大小警告；建置成功，此警告目前可接受。

## 6. Git commit and push result

- Batch 12 commit hash：`af58b8b`
- Current branch：`dev`
- Remote URL：`https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Push result：Batch 12 implementation 與 final report update 已推送到 `origin/dev`。

## 7. Visible UI description

- 「量測資料」分頁新增內部分區：匯入資料、資料處理、視覺化 / 比較、Metadata / 關聯。
- 資料處理面板可選擇 source dataset、X column 與 Y column。
- Operation controls 可新增 abs(Y)、Y 取負號、最大值正規化、Min-Max 正規化、面積正規化、扣除常數 baseline、扣除線性 baseline。
- Operation list 支援 enabled/disabled、移除、上移、下移與 baseline 參數編輯。
- 電性資料會顯示「電流正負號處理」helper，提醒 abs(I) 需確認接線方向與掃描方向。
- Raman / PL 資料會顯示「光譜正規化」helper，提醒正規化會改變強度判讀。
- 可按「產生處理後資料」建立 processed dataset，並在 processed data preview 查看前 20 筆。
- Peak marker panel 支援手動輸入 x 值、label、assignment，也支援 local maximum auto suggestion。
- Peak marker list 可編輯 label / assignment 並刪除 marker。
- Plot 可疊加 raw 與 processed data，並顯示 peak markers 的垂直 dashed lines。
- Markdown 報告會新增處理摘要；JSON 匯出會包含原始資料、處理後資料、peak markers 與 comparisons。
- 截圖已儲存：
  - `screenshots/batch12-measurement-processing.png`
  - `screenshots/batch12-peak-markers.png`
  - `screenshots/batch12-electrical-abs-current.png`

## 8. Warnings or limitations

- Browser Use / Node REPL browser automation 仍因 Codex WindowsApps node 存取權限問題無法啟動，因此使用 Edge headless 截圖作為 fallback。
- 目前資料處理是初步視覺化與整理工具，不是 publication-grade analysis。
- baseline correction 尚未做物理或統計驗證。
- auto peak suggestion 只是 local maximum 規則，不是 fitting、Raman mode assignment 或材料相鑑定。
- abs(I) 不一定適合所有電性資料，仍需確認接線方向、掃描方向與物理問題。
- 尚未實作 Lorentzian / Gaussian / Voigt fitting、smoothing、TLM fitting、XPS fitting、AFM image import、Origin binary parser 或 Excel parser。

## 9. Next recommended batch

Batch 13：Raman / PL peak analysis and before-after interpretation helpers。
