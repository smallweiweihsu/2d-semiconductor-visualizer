# Batch Report

## 1. Summary of what was built

完成 Batch 4：新增使用者指定的 Sb 塊材 / Sb₂O₃ / WSe₂ / Pd / 上閘極元件模板，並加入模板選擇器。元件結構編輯器現在可在「基礎二維半導體堆疊」與「Sb 塊材底部源極 WSe₂ 上閘極元件」之間切換。

本批也改善 2D 側視預覽，讓局部材料層可依 `x_um` 與 `length_um` 近似呈現水平位置；並整理材料資料庫 UI，加入搜尋、較緊湊的統計與分類篩選，以及分組材料參數詳情。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch4-device-template.png
screenshots/batch4-material-ui-cleanup.png
src/components/device/DeviceStructureEditor.tsx
src/components/device/DeviceTemplateSelector.tsx
src/components/device/LayerStackPreview.tsx
src/components/device/deviceValidation.ts
src/components/layout/RightInspector.tsx
src/components/materials/MaterialCategoryFilter.tsx
src/components/materials/MaterialDatabase.tsx
src/components/materials/MaterialDetail.tsx
src/components/materials/MaterialList.tsx
src/data/deviceStructures.ts
src/data/workspaceTabs.ts
src/types/device.ts
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
    viewer3d/
      ViewerPlaceholder.tsx
  data/
    .gitkeep
    deviceRoles.ts
    deviceStructures.ts
    materialCategories.ts
    materials.ts
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
    material.ts
    process.ts
  utils/
    .gitkeep
```

## 4. Commands run

```bash
git status --short
npm run build
npm run lint
npm run typecheck
npm install
npm run build
npm run lint
npm run typecheck
tree src /F
git add .
git commit -m "Batch 4: Add Sb WSe2 device template and material UI cleanup"
git rev-parse --short HEAD
git status --short
git add BATCH_REPORT.md
git commit -m "Batch 4: Update batch report with commit hash"
git rev-parse --short HEAD
git status --short
```

另外使用 Browser/IAB 檢查本機頁面，並使用本機 Chrome headless 產生 Batch 4 截圖：

```text
screenshots/batch4-device-template.png
screenshots/batch4-material-ui-cleanup.png
```

## 5. Build result

`npm run build` 成功通過。

建置輸出摘要：

```text
✓ 45 modules transformed.
✓ built in 183ms
```

`npm run lint` 成功通過。

`npm run typecheck` 成功通過。

## 6. Git commits created

- Batch 4 commit hash: `1cbb035`

## 7. Warnings or limitations

- 此模板目前用於建立幾何與材料堆疊模型，尚未計算真實能帶、接觸電阻、擴散、氧化或量測響應。
- 2D 側視預覽的厚度與水平位置都是視覺示意，不代表真實比例或真實製程邊界。
- Sb₂O₃ 參數、Pd/WSe₂ 接觸、Sb 表面氧化、金屬沉積損傷與退火擴散仍需後續文獻與實驗資料校準。
- 材料資料庫 UI 已降噪，但資料本身仍不是 publication-grade 文獻資料庫。
- 未實作真實 3D、電性計算、擴散計算、氧化計算、製程模擬、能帶圖、真實圖表、匯出、GitHub push 或 polygon CAD。

## 8. Visible UI description

「元件結構」分頁上方新增「內建元件模板」區塊，可選擇「基礎二維半導體堆疊」或「Sb/WSe₂ 上閘極模板」。目前預設顯示 Sb 塊材底部源極 WSe₂ 上閘極元件，包含 Sb 塊材 / 底部源極、局部 Sb₂O₃、WSe₂ 通道、Pd 汲極接觸、上方 Sb₂O₃ 介電層與上閘極。模板區塊顯示用途、標籤、模型假設與模板提醒。

2D 側視預覽現在會依材料層 `x_um` 與 `length_um` 近似顯示水平位置；局部氧化層、Pd 接觸與上閘極不再全部置中。預覽仍保留厚度視覺縮放與非真實比例提醒。

「材料資料庫」分頁已降低視覺擁擠感：頁首統計改成小型 pills，科學警示變成較輕的提示列，分類篩選更緊湊並可水平捲動，新增搜尋欄位，材料清單卡片更短，材料詳情將參數分為「核心電子參數」、「輸運與電性」、「結構與熱參數」與「擴散參數」。

截圖位置：

```text
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch4-device-template.png
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch4-material-ui-cleanup.png
```

## 9. Next recommended batch

建議 Batch 5：加入真正的 3D 視覺化基礎，例如用目前 layer stack 資料產生可旋轉的非物理 3D 幾何示意。仍先不加入電性、擴散、氧化或製程模擬。
