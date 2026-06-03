# 專案接手文件

更新日期：2026-06-04  
目前分支：`dev`  
遠端：`https://github.com/smallweiweihsu/2d-semiconductor-visualizer.git`

## 1. 專案定位

本專案是「二維半導體元件視覺化與物理沙盒」，用於整理 WSe2 / Sb2O3 / Sb / 金屬接觸 / 氧化 / 擴散 / 電性 / 量測資料 / 文獻證據等研究資訊。

核心原則：

- 所有模型皆為定性或半定量研究輔助，不是 TCAD、DFT、MD、NEGF 或完整製程模擬。
- 未經文獻與實驗校準的參數不可視為定量結論。
- 文獻候選資料不得自動寫入正式材料資料庫。
- `src/data/materials.ts` 保留為官方材料資料庫；文獻來源、候選證據與衝突整理放在獨立 literature structures。

## 2. 目前已完成進度

已完成到 Batch 15C，並已推送到 GitHub `origin/dev`。

主要功能：

- 元件結構 layer stack editor。
- 材料資料庫與材料詳情頁。
- Sb bulk / Sb2O3 / WSe2 / Pd / top gate template。
- 2D layer preview 與 3D viewer。
- 製程流程 UI。
- layer placement presets、新增 layer 後自動選取與高亮。
- Arrhenius + Fick-like 擴散近似模型。
- WSe2 → WOx / Sb → Sb2O3 氧化與 Raman 解釋模組。
- 電性近似模組，包含 Cox、carrier density、Rch、Rtotal、Id-Vd、Id-Vg、band alignment warning。
- Raman / PL / electrical 量測資料匯入、column mapping、preview、plot、comparison。
- 量測資料非破壞式處理：abs(I)、invert Y、normalization、baseline、manual peak marker、auto peak suggestion。
- 專案 JSON 匯出 / 匯入、Markdown report、experiment summary。
- 文獻資料庫 foundation、source editor、parameter evidence editor、conflict group editor、recommendation workflow、TODO list。
- Batch 15A 到 15C 的候選文獻資料：
  - WSe2 PL/Raman、oxidation、contact behavior。
  - Sb2O3 / Sb / In interface。
  - Pd/In/Ti/Au/Cr/Ni/Pt/Al/Ag/Cu/Sc metal contact 與 diffusion TODO/evidence placeholders。

## 3. 目前工作區新增變更

目前工作區已開始 Batch 15D groundwork，重點是 dielectric literature tracking。這些變更已通過 `npm run typecheck`，但尚未完成 Batch 15D 全部任務。

已修改內容：

- `src/data/literatureSources.ts`
  - 新增 dielectric / 2D interface candidate sources。
  - 新增 HfO2 / WSe2、dielectric band offset、remote phonon placeholder sources。
- `src/data/materialLiteratureTodos.ts`
  - 新增 HfO2、Al2O3、SiO2、hBN、Sb2O3 的 Batch 15D TODO generator。
  - TODO 包含 dielectricConstant、bandGap、electronAffinity、breakdownField、resistivity、leakage、interface traps、bandOffset、ALD compatibility、remote phonon、top gate、encapsulation。
- `src/data/parameterEvidence.ts`
  - 新增 dielectric constant、breakdown field、band gap、electron affinity、WSe2 band offset candidate/placeholder evidence。
  - 新增 qualitative evidence：high-k interface risk、hBN reference、Al2O3/WSe2 ALD、WSe2 high-k hysteresis、SiO2/WSe2 substrate/interface caution。
- `src/data/parameterConflictGroups.ts`
  - 新增 HfO2 process-dependent k、Al2O3 interface traps、SiO2 substrate traps、hBN clean-reference limitation、WSe2/dielectric band offset not universal、high-k benefit/interface risk、Sb2O3 conventional dielectric comparison。
- `src/data/parameterRecommendations.ts`
  - 新增 draft recommendations：不要使用 universal dielectric constant、breakdown field 需 manual/calibrated、hBN clean but not perfect、high-k interface warning、Sb2O3 需與 conventional dielectrics 條件化比較。
- `src/components/literature/LiteratureDatabaseWorkspace.tsx`
  - 新增「介電層與 band offset 重點」summary card。
  - 顯示 k evidence、breakdown、band offset、leakage/traps、ALD/interface、dielectric TODO、缺 k/breakdown、缺 band offset counts。

## 4. 技術決策

### 前端架構

- Vite + React + TypeScript。
- UI 以繁體中文為主；TypeScript interface、component name、function name、enum-like value 保持英文。
- Tailwind CSS class-based styling。
- 不新增大型 chart dependency；量測與模型曲線使用 SVG。
- 3D 使用 Three.js / React Three Fiber / Drei。

### 狀態管理

- 目前以 React local state / AppShell shared state 為主。
- deviceStructure、processFlow、measurementDatasets、measurementComparisons、processedMeasurementDatasets、peakMarkers 已進入較全域狀態。
- diffusion / oxidation / electrical 即時 scenario/result 尚未完全提升到 project-level state，因此 export report 會標示限制。

### 文獻資料設計

- 文獻資料獨立於 material notes。
- 主要型別：
  - `LiteratureSource`
  - `ParameterEvidence`
  - `ParameterConflictGroup`
  - `ParameterRecommendation`
  - `MaterialLiteratureTodo`
- 新資料預設為 `candidate` / `draft`。
- 不使用 `verified`，除非未來經人工審核確認。
- 不自動 promotion 到 `src/data/materials.ts`。

### 科學完整性

- 對缺 D0/Ea、contact resistance、dielectric constant、breakdown field、oxidation rate、band offset 等參數維持 warning。
- In / Sb2O3 只作候選 buffer topic，不宣稱有效。
- WSe2 metal contact 不以 work function alone 排名。
- High-k dielectric 不自動視為改善 device performance。

## 5. 待辦事項

### 立即待辦

- 完成 Batch 15D 尚未收尾的 UI / report integration：
  - Literature TODO quick filters：介電常數、崩潰電場、band offset、leakage/traps、ALD interface、high-k、hBN、SiO2 substrate、Sb2O3 comparison、缺 k、缺 breakdown、缺 band offset。
  - Evidence table topic markers：dielectric constant、breakdown、band offset、leakage/traps、interface quality、high-k risk、hBN reference。
  - Recommendation panel blocker detection：universal k、breakdown field、band offset、high-k always beneficial。
  - Electrical module dielectric notice：HfO2 / Al2O3 / SiO2 / hBN / Sb2O3 的 k、breakdown、band offset、leakage、interface traps 皆製程依賴。
  - Material detail dielectric compact counts。
  - Markdown report / project export dielectric literature warning。
  - README Batch 15D section。
  - Batch 15D screenshots。
- 跑完整檢查：
  - `npm install`
  - `npm run build`
  - `npm run lint`
  - `npm run typecheck`

### 下一批建議

- Batch 15D：完成 dielectric literature expansion 收尾。
- Batch 15E：extended 2D material literature tracking for MoS2, WS2, MoSe2, MoTe2, graphene, black phosphorus。

### 中期待辦

- 將 diffusion / oxidation / electrical scenario/result 提升到可保存 project state。
- 將 literature recommendations 做成明確人工 promotion workflow，但仍不得自動改寫 `materials.ts`。
- 建立 measured data import 的 persistence / restoration 測試。
- 增加 report export 的 selective section export。
- 建立簡單 e2e smoke test，至少覆蓋主要 tabs render。

## 6. 開發與驗證環境

Node/npm 已恢復正常：

- `node -v`: `v24.15.0`
- `npm -v`: `11.12.1`

本次已執行：

```text
git status --short
git branch --show-current
git remote -v
where node
where npm
node -v
npm -v
npm run typecheck
```

`npm run typecheck` 已通過。

建議後續提交前仍完整執行：

```bash
npm install
npm run build
npm run lint
npm run typecheck
```

## 7. Git 狀態與接手注意

最近已推送 commit：

- `6bd40e5` Batch 15C: Final report update
- `f2b437d` Batch 15C: Expand metal contact and diffusion literature tracking

目前這份接手文件與 Batch 15D groundwork 將一併提交。若後續接手者要繼續 Batch 15D，請從本文件第 5 節「立即待辦」開始。

## 8. 不要做的事

- 不要直接把 candidate evidence 寫入 `src/data/materials.ts`。
- 不要假造 DOI、paper title、作者、材料參數或結論。
- 不要宣稱 In 一定降低 Sb2O3 interface impact。
- 不要宣稱 Pd/WSe2 或任何 metal/WSe2 contact 是 ideal ohmic。
- 不要用 work function alone 排名 contact metal。
- 不要把 high-k dielectric 視為一定提升元件性能。
- 不要實作 automatic DOI lookup、PDF parsing、backend database、cloud sync，除非新批次明確要求。
