# Batch Report

## 1. Summary of what was built

完成 Batch 6：新增第一版「製程流程與退火擴散」工作區。使用者現在可以在「擴散與退火」分頁檢視製程時間線、新增預設製程/量測樣板、刪除、複製、上下移動、啟用/停用步驟，並編輯每個步驟的製程參數、描述、註記與關聯材料層。

本批也把元件結構 state 提升到 AppShell，讓製程流程可以讀取目前 layer stack 中的材料層，支援步驟與 Pd 汲極、WSe₂ 通道、Sb₂O₃ 介電層等材料層做資料關聯。這仍是 UI 與資料建模，不是製程模擬。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
src/components/device/DeviceStructureEditor.tsx
src/components/layout/AppShell.tsx
src/components/layout/RightInspector.tsx
src/components/layout/Workspace.tsx
src/components/process/ProcessFlowEditor.tsx
src/components/process/ProcessParameterEditor.tsx
src/components/process/ProcessStepEditor.tsx
src/components/process/ProcessStepTemplatePicker.tsx
src/components/process/ProcessSummary.tsx
src/components/process/ProcessTimeline.tsx
src/components/process/ProcessValidationPanel.tsx
src/components/process/processFormatting.ts
src/components/process/processValidation.ts
src/data/defaultProcessFlow.ts
src/data/processSteps.ts
src/data/processStepTypes.ts
src/data/workspaceTabs.ts
src/types/process.ts
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
      deviceFormatting.ts
      DeviceStructureEditor.tsx
      DeviceSummary.tsx
      DeviceTemplateSelector.tsx
      deviceValidation.ts
      DeviceValidationPanel.tsx
      LayerEditor.tsx
      LayerStackList.tsx
      LayerStackPreview.tsx
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
      materialStats.ts
      ParameterBadge.tsx
    plots/
      PlotPlaceholder.tsx
    process/
      ProcessFlowEditor.tsx
      processFormatting.ts
      ProcessParameterEditor.tsx
      ProcessStepEditor.tsx
      ProcessStepTemplatePicker.tsx
      ProcessSummary.tsx
      ProcessTimeline.tsx
      processValidation.ts
      ProcessValidationPanel.tsx
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
    materialCategories.ts
    materials.ts
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
    material.ts
    process.ts
  utils/
    .gitkeep
```

## 4. Commands run

```bash
git status --short
git branch
git remote -v
npm run typecheck
npm run lint
npm run build
npm install
npm run build
npm run lint
npm run typecheck
tree src /F
```

另外使用 Browser/IAB 開啟 `http://127.0.0.1:5174/#diffusion` 檢查製程流程 UI。DOM snapshot 已確認頁面包含「製程流程與退火擴散」。截圖 API 在本環境回傳 `Page.captureScreenshot` timeout，因此本批以文字描述記錄可見 UI。

## 5. Build result

Current verification status:

```text
npm run build: passed
npm run lint: passed
npm run typecheck: passed
```

`npm run build` still reports the known Vite chunk-size warning for the lazy-loaded 3D viewer chunk. The build completed successfully.

## 6. Git commit and push result

Pending final verification commit.

- Current branch: `dev`
- Remote URL: `https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Batch 6 commit hash: pending
- Push result: pending

## 7. Warnings or limitations

- 目前製程流程僅用於記錄與組織實驗步驟，尚未進行真實製程、擴散、氧化、蝕刻或量測模擬。
- 參數欄位與樣板是研究紀錄架構，不會自動預測 Raman、PL、XPS、AFM、I-V 或退火擴散結果。
- 製程步驟與元件材料層的關聯目前只保存資料關係，不會改變 2D/3D 幾何。
- 尚未實作真實擴散計算、氧化模型、RIE 蝕刻率、Raman/PL/XPS 解讀、AFM 形貌、電性 I-V、band diagram、匯出、polygon CAD 或文獻搜尋自動化。
- `npm run build` 的 3D viewer chunk-size warning 是 Batch 5 既有警告，不是建置失敗。

## 8. Visible UI description

「擴散與退火」分頁現在顯示「製程流程與退火擴散」工作區。上方有科學誠信提醒，說明目前只記錄與組織實驗步驟，尚未進行真實製程、擴散、氧化、蝕刻或量測模擬。

左側是流程時間線，顯示預設 `Sb/WSe₂ 元件製程草稿`，包含 Sb₂O₃ 沉積、WSe₂ 轉移 / 放置、E-beam lithography、Pd 金屬沉積、Lift-off、Raman、電性量測、退火、低溫電性量測與 AFM / XPS 候選量測。每張步驟卡可選取、上移、下移、複製、刪除與啟用/停用。

新增製程/量測步驟會展開樣板選擇器，依「製程、微影、量測、觀察、自訂」分組，顯示樣板名稱、描述、參數數量與提醒狀態。

右側步驟設定區可編輯步驟名稱、啟用狀態、描述、註記與參數。參數依型別呈現文字、數值、select、boolean 與 textarea 欄位，並顯示單位、必填標記與 confidence badge。

步驟設定下方有「關聯材料層」區塊，列出目前元件結構中的 layer name、材料名稱與角色，可用 checkbox 關聯到製程或量測步驟。下方摘要區顯示總步驟數、啟用步驟數、製程/量測/觀察微影數量、關聯材料層數、警告數，以及是否包含金屬沉積、Sb₂O₃ 沉積、退火、Raman、電性量測與 XPS/AFM。

流程提醒面板顯示缺少必要參數、金屬沉積未關聯材料層、退火缺少 D0/Ea 等 guidance。右側分析結果欄在此分頁改顯示製程摘要、缺少參數、量測對照與後續擴散模型的占位資訊。

Screenshot status:

```text
Screenshot capture attempted, but Browser/IAB screenshot API timed out with Page.captureScreenshot.
UI was verified by DOM snapshot and visible UI description above.
```

## 9. Next recommended batch

建議 Batch 7：在既有製程流程資料上加入第一版退火/擴散近似模型。仍需清楚標示資料來源、D0/Ea 缺失狀態與假設限制，並避免宣稱為 TCAD、DFT 或 MD 等完整模擬。
