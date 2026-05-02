# Batch Report

## 1. Summary of what was built

完成 Batch 15C：擴充 WSe₂ 金屬接觸、work-function 限制、contact resistance 不確定性，以及 lower-priority metals into Sb₂O₃ 擴散/界面反應追蹤。

- 新增 WSe₂ metal contact candidate sources：2D semiconductor contacts review、WSe₂-metal interface Ohmic/Schottky 議題、Au/WSe₂ vdW contact、oxidized-edge Fermi-level pinning、Ni-contact WSe₂ environmental/electrical study。
- 新增 grouped placeholder sources：metal/WSe₂ contact comparison、Sc/WSe₂ contact engineering、lower-priority metal diffusion into Sb₂O₃。
- 擴充 Pd/Ti/Au/Cr/Ni/Pt/Al/Ag/Cu/Sc/In 的 WSe₂ contact、work function、contact resistance、Fermi-level pinning、adhesion/interface layer、thermal stability 與 Raman/PL/electrical indirect effects TODOs。
- 新增 contact resistance placeholder evidence 與 work-function context evidence；work function 只作背景，不做金屬排名。
- 新增 Ti/Au/Cr/Ni/Pt/Al/Ag/Cu/Sc into Sb₂O₃ 的 D0/Ea placeholder evidence。
- 新增 qualitative interface-risk evidence：Ti reactive/adhesion risk、Au/Pt noble metals not automatically harmless、Al oxide-forming risk、Cu/Ag diffusion concern、Pt/Ni/Cr interface uncertainty、Sc contact-engineering placeholder。
- 新增 conflict groups：WSe₂ metal contact condition dependence、Ti/Au/Pd/In/Sc comparison under review、lower-priority metal diffusion into Sb₂O₃、reactive metals/oxide damage、noble metals not automatically harmless。
- 新增 draft recommendations：維持 manual/fitted contact resistance、不要 work-function-only ranking、lower-priority metal diffusion 不啟用定量、adhesion/reactive metals 作為 interface-risk variables。
- Literature UI 新增「金屬接觸與擴散重點」summary card、contact/diffusion counts、TODO quick filters、evidence topic markers。
- Electrical module 新增 WSe₂ 金屬接觸文獻提醒。
- Diffusion module 文獻提醒擴展到 Pd/In/Ti/Au/Cr/Ni/Pt/Al/Ag/Cu/Sc into Sb₂O₃。
- Material Detail 對金屬顯示 WSe₂ contact、work function、Sb₂O₃ diffusion、recommendations 與 unresolved gaps compact counts。
- 沒有修改 `src/data/materials.ts`，沒有自動 promotion candidate values。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch15c-contact-evidence.png
screenshots/batch15c-electrical-literature-warning.png
screenshots/batch15c-metal-contact-summary.png
src/components/diffusion/DiffusionModelPanel.tsx
src/components/electrical/ElectricalModelPanel.tsx
src/components/literature/LiteratureDatabaseWorkspace.tsx
src/components/literature/MaterialLiteratureTodoPanel.tsx
src/components/literature/ParameterEvidenceTable.tsx
src/components/literature/ParameterRecommendationPanel.tsx
src/components/materials/MaterialDetail.tsx
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
  WSe2 metal contacts Fermi level pinning Schottky barrier work function contact resistance review
  WSe2 van der Waals metal contacts Fermi-Level Pinning-Free WSe2 Transistors DOI
  metal-induced gap states WSe2 metal contacts Fermi level pinning
  contact engineering WSe2 MoS2 transition metal dichalcogenide contacts review DOI
  Allain Kang Banerjee Kis Electrical contacts to two-dimensional semiconductors Nat Mater 2015 DOI
  Does p-type ohmic contact exist in WSe2 metal interfaces Nanoscale 2016 DOI
  WSe2 metal contact resistance Ti Au Pd In Sc contact Fermi level pinning DOI
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe -v
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\typescript\bin\tsc -b
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\eslint\bin\eslint.js .
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe node_modules\vite\bin\vite.js build
Chrome headless screenshots for Batch 15C UI
git add ...
git commit -m "Batch 15C: Expand metal contact and diffusion literature tracking"
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
- Verified candidate sources added from DOI/publisher-searchable records:
  - Nature Materials DOI: `https://doi.org/10.1038/nmat4452`
  - Nanoscale DOI: `https://doi.org/10.1039/C5NR09094H`
  - Nature Electronics DOI: `https://doi.org/10.1038/s41928-022-00746-6`
  - Nanoscale Advances DOI: `https://doi.org/10.1039/D2NA00307H`
  - Nanomaterials DOI: `https://doi.org/10.3390/nano8110901`
- Topics still TODO: comparable Pd/Ti/Au/In/Sc contact resistance for the user’s exact geometry, lower-priority metals into Sb₂O₃ D0/Ea, metal/Sb₂O₃ interface reaction data.

## 5. Build/lint/typecheck result

- `npm install`: not run because npm is unavailable in the Codex shell PATH.
- `npm run typecheck`: fallback equivalent passed via local TypeScript binary.
- `npm run lint`: fallback equivalent passed via local ESLint binary.
- `npm run build`: fallback equivalent passed via local Vite binary.
- Build warning: Vite still reports the known large lazy 3D viewer chunk warning; build succeeded.

## 6. Git commit and push result

- Batch 15C commit hash: `f2b437d`
- Current branch: `dev`
- Remote URL: `https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Push result: `f2b437d` successfully pushed to `origin/dev`.
- Final report update commit: created after this report update.

## 7. Visible UI description

- 文獻資料庫分頁顯示新的「金屬接觸與擴散重點」summary card。
- Summary card 顯示 WSe₂ contact evidence、WSe₂ contact TODO、Sb₂O₃ diffusion evidence、diffusion TODO、缺 contact R、缺 D0/Ea counts。
- TODO panel 顯示 WSe₂ 接觸、金屬 work function、接觸電阻、Fermi-level pinning、Sb₂O₃ 擴散、反應性金屬、惰性金屬、缺 contact resistance、缺 D0/Ea 快速篩選。
- Evidence table 顯示 WSe₂ contact、work function context、diffusion missing、oxide interface risk markers。
- Conflict groups 顯示 WSe₂ metal contact condition dependence、Ti/Au/Pd/In/Sc comparison under review、lower-priority metal diffusion、reactive metals oxide damage、noble metals not automatically harmless。
- Recommendation panel 對 default contact resistance、work-function-only ranking、quantitative diffusion modeling blockers 顯示阻擋提示。
- Electrical tab 顯示 WSe₂ 金屬接觸文獻提醒。
- Diffusion tab 對 Pd/In/Ti/Au/Cr/Ni/Pt/Al/Ag/Cu/Sc into Sb₂O₃ 顯示 D0/Ea evidence 提醒。
- Material Detail 對 Pd/Ti/Au/In 等金屬顯示 WSe₂ contact、work function、Sb₂O₃ diffusion、recommendations、unresolved gaps compact counts。

## 8. Warnings or limitations

- 沒有自動 promotion 到 `materials.ts`。
- 沒有 verified source 或 verified parameter。
- 沒有 contact fitting、TLM fitting 或 diffusion coefficient fitting。
- Work function evidence 只作背景，不可用於金屬排名。
- WSe₂ contact resistance 仍需手動輸入、量測、TLM 或 fitting。
- Lower-priority metals into Sb₂O₃ 的 D0/Ea 仍是 null placeholder，不可定量。
- Reactive / noble metal interface risk evidence 仍多為 placeholder，不可視為結論。
- 沒有 automatic DOI lookup、PDF parsing、backend database 或 cloud sync。

## 9. Next recommended batch

Batch 15D: dielectric literature expansion for HfO₂, Al₂O₃, SiO₂, hBN and band offset / leakage parameter tracking.

Screenshots:

```text
screenshots/batch15c-metal-contact-summary.png
screenshots/batch15c-contact-evidence.png
screenshots/batch15c-electrical-literature-warning.png
```
