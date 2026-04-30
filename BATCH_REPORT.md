# Batch Report

## 1. Summary of what was built

完成 Batch 2：建立第一版材料資料庫與材料 UI。新增 TypeScript 材料型別系統、材料分類對照、29 筆初始材料資料、分類篩選、材料清單、材料詳情、參數表格、信心標示 badge、缺少參數摘要與科學完整性提醒。

「材料資料庫」分頁現在會顯示實際材料資料庫 UI，而其他分頁仍維持 Batch 1 的占位介面。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch2-material-database.png
src/components/layout/AppShell.tsx
src/components/layout/Workspace.tsx
src/components/materials/MaterialCategoryFilter.tsx
src/components/materials/MaterialDatabase.tsx
src/components/materials/MaterialDetail.tsx
src/components/materials/MaterialList.tsx
src/components/materials/ParameterBadge.tsx
src/components/materials/materialStats.ts
src/data/materialCategories.ts
src/data/materials.ts
src/data/workspaceTabs.ts
src/types/material.ts
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
    materialCategories.ts
    materials.ts
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
  utils/
    .gitkeep
```

## 4. Commands run

```bash
git status --short
git add .
git commit -m "Batch 1: Traditional Chinese app shell"
git rev-parse --short HEAD
git status --short
npm install
npm run build
npm run lint
npm run typecheck
tree src /F
```

另外使用本機 Chrome headless 產生材料資料庫截圖：

```text
screenshots/batch2-material-database.png
```

## 5. Build result

`npm run build` 成功通過。

建置輸出摘要：

```text
✓ 34 modules transformed.
✓ built in 164ms
```

`npm run lint` 成功通過。

`npm run typecheck` 成功通過。

## 6. Warnings or limitations

- 本批只實作材料資料結構、材料資料庫與 UI。
- 材料參數包含已知值、估計值與未知值；估計值不可視為文獻級精密資料。
- 標示為「需要文獻參數」的欄位目前使用 `value: null` 與 `confidence: "unknown"`。
- 尚未實作真實 3D、元件幾何編輯、電性計算、擴散計算、氧化計算、能帶圖、真實圖表、匯出或 CAD。
- Batch 1 已建立本機 Git commit；Batch 2 變更目前保留為未提交狀態。

## 7. Visible UI description

「材料資料庫」分頁顯示繁體中文標題、資料庫說明、科學警示框、材料總數摘要、分類篩選按鈕、材料清單與材料詳情面板。材料清單會顯示材料色點、材料名稱、分類、描述、警示數與參數狀態。材料詳情面板會顯示材料名稱、分類、描述、色彩預覽、材料註記、風險限制、已知/估計/缺少參數數量，以及包含功函數、能隙、電子親和能、介電常數、遷移率、電阻率、晶格常數、預設厚度、崩潰電場與熔點的參數表格。

截圖位置：

```text
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch2-material-database.png
```

## 8. Next recommended batch

建議 Batch 3：建立第一版「元件結構」資料模型與純 UI layer stack 編輯器，讓使用者可以新增、刪除、排序材料層並選擇 Batch 2 材料資料庫中的材料；仍先不加入真實 3D 或物理計算。
