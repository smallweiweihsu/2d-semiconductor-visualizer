# 2D 半導體元件視覺化平台

二維半導體元件視覺化與模擬平台。這個 repo 目前已依照設計系統文件重建成固定深色主題的 Lithograph 微影蝕刻美學介面，支援結構設計、製程規劃、電性模擬、能帶圖、材料資料庫、文獻管理、量測資料與研究假說追蹤。

![首頁儀表板](screenshots/codex-dashboard-qa.png)

## 技術架構

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- React Three Fiber + Drei + Three.js
- Recharts
- Wouter
- Lucide React
- Playwright 視覺化驗證

## 目前頁面

| 路徑 | 頁面 | 目前內容 |
| --- | --- | --- |
| `/` | 儀表板 | Hero 區塊、統計卡片、活躍元件、缺少參數警告、近期研究概覽 |
| `/device-builder` | 元件結構編輯器 | 三欄式 layer stack、視覺化 viewport、屬性面板、3D / 爆炸圖模式 |
| `/process-flow` | 製程流程 | 12 步製程時間軸、步驟選擇器、參數檢視面板 |
| `/iv-simulator` | I-V 電性模擬 | Mobility / Vth 互動控制、Id-Vg 與 Id-Vd 曲線 |
| `/band-diagram` | 能帶圖 | 金屬選擇、接觸前後模式、Schottky barrier 摘要 |
| `/materials` | 材料資料庫 | 可搜尋材料資料庫、參數信心指標 |
| `/references` | 文獻管理 | 文獻列表、審閱狀態、可靠性評分 |
| `/measurements` | 量測資料 | 量測 metadata 與訊號預覽 |
| `/comparison-lab` | 材料比較實驗室 | WSe2、MoS2、Pd、Ti 參數比較表 |
| `/research-notes` | 研究筆記 | 假說追蹤與相關研究資料連結 |

## 設計系統

介面採用固定深色主題的 Lithograph 微影蝕刻方向：

- 深藍黑色科學儀器工作區
- Cyan 作為主要操作與選取狀態
- 參考 SEM / AFM 控制面板的高密度資訊布局
- 使用 OKLCH token 管理背景、卡片、文字、主色、邊框、輔助文字與圖表色
- UI 文字使用 Inter，數值與科學資料使用 JetBrains Mono
- 參數信心狀態：已知為綠色、估計為黃色、未知為紅色
- 材料色彩：WSe2 紫色、MoS2 藍色、hBN 青色、Sb 灰藍、Sb2O3 淺藍、WOx 橙色、Pd 銀白、Ti 深灰、In 淺藍、HfO2 白灰

## 目前內建研究資料

目前 app 使用設計文件中的 seed data：

- 10 筆半導體 / 材料資料
- Sb/WSe2 上閘極元件結構
- 6 層元件 stack
- 12 步製程流程
- 5 筆量測資料
- 5 筆文獻來源
- 4 筆研究假說

## 截圖

![元件結構編輯器](screenshots/codex-device-builder-qa.png)

![手機版材料資料庫](screenshots/codex-materials-mobile-qa.png)

## 安裝方式

```bash
npm install
```

## 啟動方式

```bash
npm run dev
```

Vite 通常會啟動在：

```text
http://localhost:5173/
```

## 驗證方式

```bash
npm run build
npm run lint
npm test
```

最近一次本機驗證結果：

- `npm run build`：通過
- `npm run lint`：通過
- `npm test`：2 個測試檔通過，共 33 個測試通過
- Playwright smoke QA：首頁可正常渲染、Device Builder 導航可用、EXPLODED 模式可切換、手機版 Materials 頁面可正常顯示

目前建置時會看到 Vite bundle size warning，原因是 Three.js 與 Recharts 都被打進主要 bundle。這對目前單入口原型是可接受的，之後可透過 route-level code splitting 改善。

## 後續可添加內容

1. 路由層級 code splitting  
   只在需要的頁面載入 Three.js、Recharts 與較重的 workspace 模組，降低首頁 bundle。

2. 真實資料持久化  
   先加入本機 project save / load，再視需求接 Supabase、Postgres 或其他後端，同步元件、材料、量測、文獻與研究筆記。

3. 可編輯資料模型  
   將目前 seed mock data 改成可編輯表單：新增材料、編輯 layer geometry、重新排序製程步驟、附加文獻 evidence、儲存研究假說。

4. 更完整的 Device Builder  
   將 CSS layer fallback 與 React Three Fiber viewport 整合成同一份資料來源，加入拖曳控制、TOP / SIDE camera、layer 顯示切換、opacity slider 與電壓設定。

5. 量測資料匯入  
   支援 Raman、PL、XPS、AFM、electrical sweep 的 CSV / TXT 匯入，加入欄位對應、單位處理、平滑化、baseline correction 與 peak marker。

6. 文獻 evidence workflow  
   加入 DOI metadata lookup、參數擷取審閱、衝突分組、source confidence 與每個參數的 citation link。

7. 更深入的物理模型  
   擴充簡化 MOSFET 與 band alignment：contact resistance、Fermi-level pinning 註記、interface states、oxide thickness、temperature 與 uncertainty band。

8. 匯出與報告  
   從選定 device、process、measurement、literature 與 hypothesis 產生 Markdown / PDF 研究報告。

9. Accessibility 與鍵盤操作  
   加入 skip link、更明確 focus state、頁面 / 分頁 keyboard shortcut，並改善視覺化 device stack 的 ARIA 描述。

10. CI 與視覺回歸測試  
   加入 GitHub Actions，自動執行 lint / build / test，並用 Playwright 對 desktop 與 mobile 截圖做 regression check。

## 目前限制

- 目前使用靜態 mock data，使用者操作不會永久保存。
- 多數控制項仍是 prototype-level local state，還不是完整 CRUD 流程。
- 物理模型刻意簡化，未經實驗校準前不適合用於 publication-grade 定量分析。
- 3D viewport 目前保留 CSS layer-stack fallback，以確保在不同 browser / driver 截圖環境下仍能看到元件結構。
