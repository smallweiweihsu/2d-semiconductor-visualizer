# Batch Report

## 1. Summary of what was built

完成 Batch 9：新增第一版「電性分析與 I-V 近似」模組，用於以簡化閘極電容、載子密度、通道電阻與手動接觸電阻產生 I-V / Id-Vg 趨勢，並顯示接觸、閘極控制、介電層風險與能帶 / 接觸定性提醒。

- 新增電性 type system，涵蓋接觸模型、載子型態、電性情境、曲線資料、結果摘要與驗證結果。
- 新增電性 physics utilities：gate capacitance、induced carrier density、channel resistance、total resistance、Ohmic-like current、Id-Vd / Id-Vg curve generation、dielectric field、breakdown/contact/gate-control risk heuristics。
- 新增 electrical presets：Sb/WSe₂ 上閘極近似模型、通用 2D FET Ohmic-like 近似、接觸限制 2D 元件模型、Schottky-like 警示模型。
- 新增電性 UI：情境選擇器、參數編輯器、layer selectors、材料資料庫帶入按鈕、結果摘要、Id-Vd / Id-Vg SVG plot、warning panel、band alignment preview。
- 可從目前元件結構讀取 channel/source/drain/gate/gate dielectric layers，帶入通道尺寸、介電層厚度與材料資料庫候選參數。
- 可連結製程流程中的電性量測或低溫電性量測步驟，嘗試帶入 Vd/Vg 掃描範圍與溫度。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch9-electrical-model.png
screenshots/batch9-iv-curves.png
src/components/electrical/BandAlignmentPreview.tsx
src/components/electrical/ElectricalCurvePlot.tsx
src/components/electrical/ElectricalModelPanel.tsx
src/components/electrical/ElectricalParameterEditor.tsx
src/components/electrical/ElectricalResultSummary.tsx
src/components/electrical/ElectricalScenarioSelector.tsx
src/components/electrical/ElectricalWarnings.tsx
src/components/electrical/ElectricalWorkspace.tsx
src/components/electrical/electricalFormatting.ts
src/components/layout/Workspace.tsx
src/data/electricalPresets.ts
src/physics/electrical.ts
src/types/electrical.ts
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
    electricalPresets.ts
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
    electrical.ts
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
npm install
```

`npm install` could not run in this desktop shell because `npm` was not available in PATH. The project already had `node_modules`; verification was completed with bundled Node and local project binaries:

```bash
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\typescript\bin\tsc -b
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\eslint\bin\eslint.js .
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\vite\bin\vite.js build
```

Visual verification:

```text
Started local Vite dev server with bundled Node.
Opened http://127.0.0.1:5174/#electrical by headless Edge screenshot.
Verified 電性分析與 I-V 近似 page renders.
Verified scenario selector, missing-parameter warnings, result summary, parameter editor area, and risk badges are visible.
Generated screenshots with headless Edge.
```

## 5. Build/lint/typecheck result

```text
npm install: not available in current shell because npm was not found in PATH.
typecheck via local TypeScript binary: passed
lint via local ESLint binary: passed
build via local Vite binary: passed
```

Build still reports the known Vite chunk-size warning for the lazy-loaded 3D viewer bundle. This is not a build failure.

## 6. Git commit and push result

- Current branch: `dev`
- Remote URL: `https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Batch 9 commit hash: `8890577`
- Push result: pending final push to `origin/dev`

## 7. Visible UI description

The 「電性分析」 tab now shows a real workspace titled 「電性分析與 I-V 近似」. It includes a scientific integrity notice, electrical scenario selector, quick presets, parameter editor, layer selectors, material database load buttons, measurement-step selector, result summary, Id-Vd plot, Id-Vg plot, warning panel, and qualitative band alignment preview.

When required parameters are missing, the result summary shows that quantitative I-V / Id-Vg curves cannot be generated. The model warns about missing mobility, missing dielectric constant, missing contact resistance, WSe₂ metal-contact uncertainty, Fermi-level pinning, interface states, leakage/breakdown risks, and the fact that low-temperature transport is not modeled.

When mobility, dielectric constant, dielectric thickness, geometry, and contact resistance are provided, the model can generate simple Ohmic-like Id-Vd and Id-Vg trend curves. These curves are explicitly labeled as simplified model output, not measured data.

Screenshots:

```text
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch9-electrical-model.png
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch9-iv-curves.png
```

## 8. Warnings or limitations

- This is a simplified capacitance / channel resistance / contact resistance approximation tool, not TCAD, NEGF, DFT, or a real 2D contact-transport solver.
- Pd/WSe₂ or other metal/WSe₂ contacts are not assumed ideal Ohmic.
- Work function alone does not determine real contact behavior.
- Gate leakage, dielectric breakdown, trap states, hysteresis, low-temperature transport, Schottky transport, and measured-data fitting are not implemented.
- Contact resistance, mobility, dielectric constants, threshold voltage, and breakdown field require experiment or literature calibration.
- In this environment, `npm` was temporarily unavailable in PATH; checks were run through local binaries with bundled Node.

## 9. Next recommended batch

Next recommended batch: Batch 10, measured data import / comparison or export report system.
