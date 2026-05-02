# Batch Report

## 1. Summary of what was built

完成 Batch 11：新增第一版「量測資料匯入與比較」功能。

- 新增 `MeasurementDataset`、`MeasurementColumn`、`MeasurementSeries`、`MeasurementComparison` 等量測資料型別。
- 新增 CSV / TXT / DAT / manual paste 的輕量解析工具，支援自動偵測逗號、Tab、空白與分號分隔。
- 新增欄位類型推論與手動欄位對應，可標示 Raman shift、wavelength、energy、intensity、voltage、current、temperature、time 或 custom。
- 新增「量測資料」分頁，包含匯入面板、欄位對應器、資料集清單、metadata 編輯器、資料預覽、SVG plot、比較面板與提醒區。
- 可把量測資料連結到目前 device layers 與 process steps。
- 支援同類型資料集疊圖與 before / after / reference comparison 物件。
- JSON 匯出已整合 `measurementDatasets` 與 `measurementComparisons`。
- Markdown 報告已新增量測資料摘要與量測比較摘要，不嵌入完整原始資料表以避免報告過大。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch11-measurement-comparison.png
screenshots/batch11-measurement-import.png
screenshots/batch11-measurement-plot.png
src/components/export/ProjectExportWorkspace.tsx
src/components/layout/AppShell.tsx
src/components/layout/Workspace.tsx
src/components/measurements/MeasurementColumnMapper.tsx
src/components/measurements/MeasurementComparisonPanel.tsx
src/components/measurements/MeasurementDataPreview.tsx
src/components/measurements/MeasurementDatasetList.tsx
src/components/measurements/MeasurementImportPanel.tsx
src/components/measurements/MeasurementMetadataEditor.tsx
src/components/measurements/MeasurementPlot.tsx
src/components/measurements/MeasurementWarnings.tsx
src/components/measurements/MeasurementWorkspace.tsx
src/components/measurements/measurementFormatting.ts
src/data/workspaceTabs.ts
src/types/measurement.ts
src/types/project.ts
src/utils/markdownReport.ts
src/utils/measurementImport.ts
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
      MeasurementWarnings.tsx
      MeasurementWorkspace.tsx
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
    projectExport.ts
```

## 4. Commands run

```text
where.exe node
where.exe npm
node -v
npm -v
git status --short
git branch --show-current
git remote -v
git add BATCH_REPORT.md
git commit -m "Batch 10: Final report update"
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\typescript\bin\tsc -b
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\eslint\bin\eslint.js .
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\vite\bin\vite.js build
tree src /F
Microsoft Edge headless screenshots for #measurements
git add ...
git commit -m "Batch 11: Add measured data import and comparison"
git commit -m "Batch 11: Final report update"
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

- Batch 11 commit hash：`ad96a16`
- Current branch：`dev`
- Remote URL：`https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Push result：Batch 11 implementation 與 final report update 已推送到 `origin/dev`。

## 7. Visible UI description

- 新增頂部分頁「量測資料」，tab bar 仍維持水平捲動。
- 工作區標題為「量測資料匯入與比較」，並顯示科學誠信提醒：匯入功能只用於整理、視覺化與初步比較，不能直接視為定量結論。
- 匯入面板提供量測類型選擇、檔案輸入、分隔符號選擇、資料集名稱與手動貼上資料欄位。
- 內建 Raman-like 範例資料可用於快速測試 manual paste import。
- 欄位對應器會列出原始欄位、推測欄位類型、單位與樣本值，使用者可手動修改欄位 mapping。
- 資料集清單顯示資料集名稱、量測類型、匯入時間、資料列數、關聯材料層 / 製程步驟數與警告數。
- Metadata editor 可編輯 before/after/reference 標籤、儀器與 Raman / PL / electrical 相關 metadata，並可勾選關聯 device layers 與 process steps。
- Data preview 顯示前 20 筆資料。
- SVG plot 可顯示同類型資料集 overlay，並支援 abs(I) 與 log10(Y) toggle。
- Comparison panel 可儲存同類型資料集的 before/after/reference 比較，並顯示 Raman、PL、電性資料的判讀提醒。
- Export integration：JSON 匯出包含量測資料與比較；Markdown 報告包含量測資料摘要與比較摘要。
- 截圖已儲存：
  - `screenshots/batch11-measurement-import.png`
  - `screenshots/batch11-measurement-plot.png`
  - `screenshots/batch11-measurement-comparison.png`

## 8. Warnings or limitations

- Browser Use / Node REPL browser automation 仍因 Codex WindowsApps node 存取權限問題無法啟動，因此使用 Edge headless 截圖作為 fallback。
- 目前量測資料只存在瀏覽器 state；需透過專案 JSON 匯出保存。
- 目前不支援 Origin binary、Excel parser、baseline correction、smoothing、peak fitting、Raman mode assignment、PL quantum yield、electrical fitting、TLM fitting、XPS fitting 或 AFM image import。
- Plot 是快速視覺化，不包含儀器校正、背景扣除或 fitting。
- before/after 比較不會自動判定氧化態、材料品質或導電機制。
- Markdown 報告只列量測摘要；完整 raw data 保存在 JSON 匯出中。

## 9. Next recommended batch

Batch 12：basic data processing tools，例如 abs(I)、normalization、baseline correction placeholder，以及 simple Raman / PL peak marking。
