# Batch Report

## 1. Summary of what was built

完成 Batch 7：新增「退火 / 擴散近似模型第一版」，整合到既有「擴散與退火」工作區，並保留製程時間線。

- 新增 Arrhenius 擴散係數與 Fick-like 擴散長度計算工具。
- 新增 Pd / In / Ti / Au 等金屬進入 Sb₂O₃ 的擴散情境 presets，D0 / Ea 未知者維持 `null` 並清楚標示需要文獻參數。
- 新增擴散參數編輯器，可設定擴散物種、host 材料、目標材料層、關聯製程步驟、溫度、時間、D0、Ea、擴散維度與修正因子。
- 新增結果摘要、1D 正規化濃度曲線 SVG、沉積前後示意圖與模型警告面板。
- 擴散模型可讀取目前元件材料層厚度，用於比較估計受影響深度與目標層厚度。
- 擴散模型可選擇關聯製程步驟，並嘗試讀取退火溫度、時間、擴散物種、host、D0 與 Ea。
- 明確加入科學完整性聲明：此模型是定性 / 半定量輔助工具，不代表 TCAD、DFT、MD 或完整製程模擬。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch7-diffusion-model.png
screenshots/batch7-diffusion-profile.png
src/components/diffusion/DiffusionModelPanel.tsx
src/components/diffusion/DiffusionParameterEditor.tsx
src/components/diffusion/DiffusionProfilePlot.tsx
src/components/diffusion/DiffusionResultSummary.tsx
src/components/diffusion/DiffusionScenarioSelector.tsx
src/components/diffusion/DiffusionSchematic.tsx
src/components/diffusion/DiffusionWarnings.tsx
src/components/diffusion/diffusionFormatting.ts
src/components/layout/Workspace.tsx
src/components/process/ProcessDiffusionWorkspace.tsx
src/components/process/ProcessFlowEditor.tsx
src/data/diffusionPresets.ts
src/physics/diffusion.ts
src/types/diffusion.ts
```

## 3. src/ file tree

```text
src/
  App.tsx
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
    materialCategories.ts
    materials.ts
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
    material.ts
    process.ts
  utils/
    .gitkeep
```

## 4. Commands run

```bash
git status --short
git branch --show-current
git remote -v
npm install
npm run build
npm run lint
npm run typecheck
```

Browser/IAB verification:

```text
Opened http://127.0.0.1:5174/#diffusion
Verified 製程時間線 and 擴散估算 internal tabs.
Verified Pd 進入 Sb₂O₃ preset and missing D0/Ea empty-state warning.
Verified target layer selector and process-step linkage controls.
Entered D0 = 1e-18 m²/s and Ea = 0.6 eV.
Verified result summary, diffusion length, 1D normalized concentration plot, and before/after schematic.
Reloaded 元件結構 tab and verified 3D viewer, 新增材料層, and 快速放置 still render.
Reloaded 材料資料庫 tab and verified search/detail UI still renders.
Saved screenshots to screenshots/batch7-diffusion-model.png and screenshots/batch7-diffusion-profile.png.
```

## 5. Build/lint/typecheck result

```text
npm install: passed
npm run build: passed
npm run lint: passed
npm run typecheck: passed
```

Build still reports the known Vite chunk-size warning for the lazy-loaded 3D viewer bundle. This is not a build failure.

## 6. Git commit and push result

- Current branch: `dev`
- Remote URL: `https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Batch 7 commit hash: `f8c5333`
- Push result: pending final push to `origin/dev`

## 7. Visible UI description

The 「擴散與退火」 tab now opens a combined workspace titled 「製程流程與退火擴散」. It has two internal tabs: 「製程時間線」 keeps the existing process flow editor, while 「擴散估算」 shows the new diffusion model panel.

The diffusion model panel includes a visible scientific integrity notice, a preset selector for metal-into-Sb₂O₃ scenarios, quick chips for Pd / In / Ti / Au, a parameter editor, target material layer selector, process-step selector, result summary, warning panel, SVG concentration profile, and before/after diffusion schematic.

When D0 or Ea is missing, the UI shows that quantitative curves cannot be generated. When D0 and Ea are manually entered, the model updates D(T), effective D, diffusion length, affected depth, risk heuristic, and the normalized concentration profile.

Screenshots:

```text
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch7-diffusion-model.png
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch7-diffusion-profile.png
```

## 8. Warnings or limitations

- This is a simplified Arrhenius + Fick-like approximation only.
- D0 / Ea values for the provided presets are intentionally unknown until verified from literature or experiments.
- In is treated only as a candidate buffer metal; the app does not claim it improves every Sb₂O₃ interface.
- The model does not simulate real interface chemistry, grain-scale diffusion, defect-assisted diffusion, morphology, XPS spectra, Raman / PL response, electrical I-V curves, or 3D diffusion clouds.
- Diffusion results do not modify 2D or 3D device geometry in this batch.
- The known Vite 3D viewer chunk-size warning remains.

## 9. Next recommended batch

Next recommended batch: Batch 8, oxidation / WOx / Raman interpretation module.
