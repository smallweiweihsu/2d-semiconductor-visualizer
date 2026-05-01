# Batch Report

## 1. Summary of what was built

完成 Batch 5：加入第一版 3D 元件視覺化。元件結構編輯器現在可以把目前 layer stack 轉成 Three.js / React Three Fiber 的 3D 矩形幾何示意，支援 orbit、zoom、pan、視角切換、標籤顯示、透明度、可見性切換與爆炸圖模式。

本批也保留原本 2D 側視圖，並改善材料資料庫頁面的垂直版面，讓材料清單與材料詳情面板在 1920x1080 桌面畫面中使用更多可用高度。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
package-lock.json
package.json
screenshots/batch5-3d-device-viewer.png
screenshots/batch5-3d-exploded-view.png
screenshots/batch5-material-vertical-layout.png
src/components/device/DeviceStructureEditor.tsx
src/components/materials/MaterialDatabase.tsx
src/components/materials/MaterialDetail.tsx
src/components/materials/MaterialList.tsx
src/components/viewer3d/Device3DViewer.tsx
src/components/viewer3d/DeviceLayerMesh.tsx
src/components/viewer3d/LayerLabel3D.tsx
src/components/viewer3d/ViewerControls.tsx
src/components/viewer3d/viewerScaling.ts
src/components/viewer3d/viewerTypes.ts
```

## 3. Dependencies added

```text
three
@react-three/fiber
@react-three/drei
```

## 4. src/ file tree

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
      Device3DViewer.tsx
      DeviceLayerMesh.tsx
      LayerLabel3D.tsx
      ViewerControls.tsx
      ViewerPlaceholder.tsx
      viewerScaling.ts
      viewerTypes.ts
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

## 5. Commands run

```bash
git status --short
npm install three @react-three/fiber @react-three/drei
npm run build
npm run lint
npm run typecheck
npm install
npm run build
npm run lint
npm run typecheck
tree src /F
git add .
git commit -m "Batch 5: Add first 3D device viewer"
git rev-parse --short HEAD
git status --short
```

另外使用 Browser/IAB 檢查 3D viewer 與材料資料庫，並使用截圖與像素檢查確認 3D canvas 不是空白：

```text
screenshots/batch5-3d-device-viewer.png: colored_pixels=19675
screenshots/batch5-3d-exploded-view.png: colored_pixels=20494
```

## 6. Build result

`npm run build` 成功通過。

建置輸出摘要：

```text
✓ 602 modules transformed.
✓ built in 492ms
```

`npm run lint` 成功通過。

`npm run typecheck` 成功通過。

Vite 顯示 Three.js / React Three Fiber lazy chunk 超過 500 kB 的警告。3D viewer 已用 `React.lazy` 拆成獨立 chunk，避免材料資料庫等非 3D 頁面初始載入完整 3D 模組。

## 7. Git commits created

- Batch 5 commit hash: `待提交後更新`

## 8. Warnings or limitations

- 此 3D 視覺化僅根據 layer stack 幾何參數產生結構示意，尚未代表真實製程形貌、晶格、能帶、擴散或電性結果。
- 厚度與位置經過視覺縮放，並非真實比例。
- 目前的 3D 幾何都是矩形 cuboid，尚未支援 polygon CAD、非矩形圖形、圓角、粗糙度或真實沉積形貌。
- 爆炸圖模式只增加視覺層間距，不代表真實結構。
- 尚未實作真實電性計算、擴散計算、氧化計算、製程模擬、能帶圖、真實圖表、匯出、GitHub push、文獻搜尋自動化、DFT / MD / TCAD 模擬。

## 9. Visible UI description

「元件結構」分頁中央新增「3D 視覺化 / 2D 側視圖」切換。3D viewer 以目前 layer stack 繪製材料層 cuboid，使用材料資料庫顏色、layer opacity 與 visible 狀態。使用者可用滑鼠旋轉、縮放與平移；也可點選 3D layer 或下方 legend 來選取材料層。

3D 控制列包含「3D 視角」、「俯視圖」、「側視圖」、「前視圖」、「重設視角」、「爆炸圖模式」與「顯示標籤」。標籤顯示 layer name、材料名或偏壓標籤，例如 Vg、Vd、Vs。爆炸圖模式會拉開材料層的垂直間距，方便檢查 Sb 塊材 / Sb₂O₃ / WSe₂ / Pd / 上閘極堆疊。

原本 2D 側視圖仍保留在同一區域，可用切換按鈕查看。材料資料庫頁面仍可搜尋、分類篩選、顯示材料清單、參數信心標示與分組材料詳情。

材料資料庫頁面垂直間距已改善：外層 workspace 改用更大的 viewport-based `min-height`，材料清單與材料詳情面板以 `flex-1 / min-h-0 / overflow-y-auto` 使用更多可用高度。Header、搜尋列、分類篩選與科學警示維持緊湊，減少整頁過度捲動。

截圖位置：

```text
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch5-3d-device-viewer.png
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch5-3d-exploded-view.png
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch5-material-vertical-layout.png
```

## 10. Next recommended batch

建議 Batch 6：建立製程流程 UI 的第一版，讓使用者可以把金屬沉積、Sb₂O₃ 沉積、氧化、退火、RIE、SEM、Raman、PL、AFM、XPS 與電性量測步驟排成 timeline，並和目前 device layer stack 做資料上的關聯。仍先不加入真實製程模擬或物理計算。
