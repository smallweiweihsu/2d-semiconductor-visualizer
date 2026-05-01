# Batch Report

## 1. Summary of what was built

完成 Batch 6.7：新增材料層放置控制與接觸位置修正，讓使用者可以用參考層與常用放置方式建立材料層，而不必只靠 x/y 數值猜測位置。

- 修正基礎二維半導體堆疊的 source/drain 預設位置，讓接觸金屬與 WSe₂ 通道重疊，不再意外漂離通道。
- 新增「新增材料層」面板，可選擇材料、材料層角色、參考材料層、放置方式與初始尺寸。
- 新增放置 presets：貼齊參考層、加在參考層上方/下方、置中於參考層、左/右側接觸金屬、源極接觸、汲極接觸、上閘極、上方介電層、局部氧化層與全寬底層。
- 在「材料層設定」新增「快速放置」區，可對既有材料層套用放置方式，或使用靠左對齊、置中對齊、靠右對齊、符合參考層尺寸。
- 新增水平重疊驗證提醒，包含接觸層未與半導體通道重疊、gate 與通道重疊不足、局部氧化層可能未與主要材料層重疊。

## 2. Files changed

```text
BATCH_REPORT.md
README.md
screenshots/batch6-7-layer-placement-controls.png
src/components/device/AddLayerPanel.tsx
src/components/device/DeviceStructureEditor.tsx
src/components/device/LayerEditor.tsx
src/components/device/deviceValidation.ts
src/components/device/layerPlacement.ts
src/data/deviceStructures.ts
src/types/device.ts
```

## 3. Commands run

```bash
git status --short
git branch --show-current
git remote -v
npm run typecheck
npm run lint
npm install
npm run build
npm run lint
npm run typecheck
```

Browser/IAB verification:

```text
Opened http://127.0.0.1:5174/#structure
Expanded side rails if localStorage had them collapsed.
Clicked 新增材料層.
Verified 新增並套用放置方式 panel is visible.
Verified 快速放置 panel is visible.
Verified 源極接觸, 汲極接觸, 上方介電層 placement options are present.
Verified geometry help text is visible.
Verified 3D 元件視覺化 and 2D 側視圖 are still present.
Saved screenshot to screenshots/batch6-7-layer-placement-controls.png.
Reloaded materials and diffusion tabs to verify material database and process flow still render.
```

## 4. Build/lint/typecheck result

```text
npm install: passed
npm run build: passed
npm run lint: passed
npm run typecheck: passed
```

Build still reports the known Vite chunk-size warning for the lazy-loaded 3D viewer bundle. This is not a build failure.

## 5. Git commit and push result

- Current branch: `dev`
- Remote URL: `https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`
- Batch 6.7 commit hash: `9eed58c`
- Report metadata commit hash: pending
- Push result: pending

## 6. Visible UI description

On the 「元件結構」 tab, clicking 「新增材料層」 now opens an inline add-layer panel instead of immediately creating a generic layer. The panel includes material selector, role selector, reference layer selector, placement preset selector, length/width/thickness fields, and 「新增並套用放置方式」.

The selected 「材料層設定」 panel now includes a 「快速放置」 section. Users can choose a reference layer and placement preset, then click 「套用放置方式」 to move the current layer. Quick buttons also support 「靠左對齊」、「置中對齊」、「靠右對齊」 and 「符合參考層尺寸」.

The geometry section now includes a help box explaining that x/y are schematic coordinates centered on the device. The 2D preview and 3D viewer still use the same center-based x/length mapping, so presets align source/drain/contact layers consistently across both views.

Screenshot:

```text
C:\Users\User\OneDrive\文件\New project 2\screenshots\batch6-7-layer-placement-controls.png
```

## 7. Warnings or limitations

- This is a UI/geometry placement hotfix only; no diffusion model, oxidation model, electrical calculation, polygon CAD, export, literature search, or real process simulation was added.
- Placement presets generate editable rectangular schematic geometry. They do not represent lithography polygons, real contact morphology, edge roughness, diffusion, oxidation, or measured electrical behavior.
- Validation warnings use simple horizontal overlap checks based on x position and length. They are guidance, not physical simulation.
- The known Vite 3D viewer chunk-size warning remains.

## 8. Next recommended batch

Next recommended batch: Batch 7, the first annealing/diffusion approximation model, using the existing process-flow data and clear warnings for missing D0/Ea and non-quantitative assumptions.
