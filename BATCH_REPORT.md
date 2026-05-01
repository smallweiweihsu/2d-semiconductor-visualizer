# Batch Report

## 1. Summary of what was built

完成 Batch 8：新增第一版「氧化模擬與 Raman 解釋」模組，用於整理 WSe₂ → WOx、Sb → Sb₂O₃ 等氧化條件，並協助判斷氧化、O₂ RIE 或環境暴露後 Raman 仍可能看到 WSe₂ 的原因。

- 新增氧化 type system，涵蓋氧化方法、目標材料、產物材料、Raman 可見性、損傷風險與模型結果。
- 新增氧化 interpretation utilities，包含估計氧化厚度、剩餘厚度、氧化比例、Raman 可見性、製程損傷風險、氧化不均勻風險與 Raman 解釋排序。
- 新增氧化 presets：WSe₂ → WOx：O₂ RIE、UV ozone、熱氧化、環境暴露，Sb → Sb₂O₃：環境暴露、熱氧化，以及通用二維材料電漿氧化。
- 新增氧化情境選擇器、參數編輯器、結果摘要、氧化進度示意、Raman 解釋面板與警告面板。
- 氧化模組可讀取目前元件材料層，並用目標層厚度作為初始厚度參考。
- 氧化模組可讀取共享製程流程步驟，並嘗試從氧化、RIE、退火或相關自訂步驟帶入時間、溫度、功率、氧氣濃度、濕度、初始材料與產物。
- AppShell 現在共享 process flow state，讓「擴散與退火」與「氧化模擬」看到同一份製程流程。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch8-oxidation-model.png
screenshots/batch8-raman-interpretation.png
src/components/layout/AppShell.tsx
src/components/layout/Workspace.tsx
src/components/oxidation/OxidationModelPanel.tsx
src/components/oxidation/OxidationParameterEditor.tsx
src/components/oxidation/OxidationProgressSchematic.tsx
src/components/oxidation/OxidationResultSummary.tsx
src/components/oxidation/OxidationScenarioSelector.tsx
src/components/oxidation/OxidationWarnings.tsx
src/components/oxidation/OxidationWorkspace.tsx
src/components/oxidation/RamanInterpretationPanel.tsx
src/components/oxidation/oxidationFormatting.ts
src/components/process/ProcessDiffusionWorkspace.tsx
src/data/oxidationPresets.ts
src/physics/oxidation.ts
src/types/oxidation.ts
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
    materialCategories.ts
    materials.ts
    oxidationPresets.ts
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
    oxidation.ts
    process.ts
  utils/
    .gitkeep
```

## 4. Commands run

```bash
git status --short
git branch --show-current
git remote -v
npm run typecheck
npm run lint
npm run build
npm install
npm run build
npm run lint
npm run typecheck
```

Browser / visual verification:

```text
Opened http://127.0.0.1:5174/#oxidation
Verified 氧化模擬與 Raman 解釋 workspace renders.
Verified WSe₂ → WOx：O₂ RIE preset and missing oxidation-rate warning.
Verified target layer selector and process-step selector.
Entered oxidation rate = 0.02 nm/s and verified result summary, oxidized thickness, remaining thickness, schematic, and Raman interpretation panel update.
Selected Sb → Sb₂O₃：環境暴露 preset and verified Sb surface oxidation warnings.
Reloaded 元件結構, 材料資料庫, and 擴散與退火 tabs to verify existing pages still render.
Generated screenshots with headless Edge.
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
- Batch 8 commit hash: pending final commit
- Push result: pending final push to `origin/dev`

## 7. Visible UI description

The 「氧化模擬」 tab now shows a real workspace titled 「氧化模擬與 Raman 解釋」. The page includes a scientific integrity notice, oxidation scenario selector, quick preset chips, parameter editor, target layer selector, process step selector, result summary, oxidation progress schematic, Raman interpretation panel, and warning panel.

When oxidation rate is missing, the UI clearly says quantitative oxidized thickness cannot be estimated and keeps Raman interpretation qualitative. When oxidation rate is manually entered, the result summary updates estimated oxidized thickness, remaining thickness, oxidation fraction, remaining fraction, Raman visibility, process damage risk, and nonuniformity risk.

The Raman interpretation panel ranks possible reasons Raman may still show WSe₂ after oxidation or O₂ RIE, including surface-only oxidation, incomplete oxidation, nonuniform oxidation, laser probing remaining lower layers, weak WOx signal, peak overlap, thickness variation, and RIE-induced defects.

Screenshots:

```text
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch8-oxidation-model.png
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch8-raman-interpretation.png
```

## 8. Warnings or limitations

- This is a qualitative / semi-quantitative interpretation tool, not a real oxidation simulator.
- Oxidation rates are intentionally missing in presets unless future literature or experimental calibration is added.
- Raman visibility is a heuristic, not a Raman intensity calculation.
- WOx stoichiometry is not fixed and must be verified experimentally.
- Sb₂O₃ thickness and chemical state require AFM/XPS or process calibration.
- Results do not update the 2D/3D geometry and do not create a 3D oxidation overlay.
- No XPS spectral fitting, PL model, AFM morphology model, electrical model, TCAD, DFT, or MD simulation was added.

## 9. Next recommended batch

Next recommended batch: Batch 9, electrical model and I-V / Id-Vg approximation module.
