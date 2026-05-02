# 二維半導體元件視覺化與物理沙盒

這是一個以瀏覽器為基礎的研究工具，用於設計、檢視與逐步分析二維半導體元件。長期目標包含 WSe₂、Sb₂O₃、Sb 塊材、Pd 接觸電極、WOx 氧化、退火擴散、I-V 曲線、能帶圖與 3D 元件結構視覺化。

目前專案仍在 MVP 開發階段。批次 10 已加入本機專案 JSON 匯出 / 匯入與 Markdown 報告產生，可把元件結構、製程流程與目前模型設定整理成研究紀錄草稿；尚未加入後端資料庫、雲端同步、PDF 匯出或實驗量測資料匯入。

## 專案簡介

- 建立一個「物理導向的視覺化與近似分析工具」。
- 讓研究者可以逐步整理二維半導體元件的結構、材料、製程條件與分析結果。
- 先以清楚的前端架構支援後續批次開發，不在早期階段過度複雜化。

## 安裝方式

請先確認已安裝 Node.js 與 npm，然後在專案根目錄執行：

```bash
npm install
```

## 啟動方式

啟動本機開發伺服器：

```bash
npm run dev
```

Vite 會在終端機顯示本機網址，通常是 `http://localhost:5173/`。

## 建置方式

產生正式建置檔：

```bash
npm run build
```

## 其他檢查指令

執行 ESLint：

```bash
npm run lint
```

執行 TypeScript 檢查：

```bash
npm run typecheck
```

## 專案資料夾結構

```text
src/
  components/
    controls/       元件控制相關元件
    dashboard/      結果面板相關元件
    device/         元件結構 Layer Stack 編輯器
    export/         專案 JSON 匯出 / 匯入與 Markdown 報告工作區
    layout/         應用程式框架、上方列、側欄、工作區與底部面板
    plots/          圖表與分析占位元件
    process/        製程流程時間線、步驟編輯器與提醒面板
    viewer3d/       Three.js / React Three Fiber 3D 視覺化元件
  data/             導覽資料與未來資料來源
  physics/          未來物理模型輔助模組
  types/            共用 TypeScript 型別
  utils/            匯出、Markdown 報告與共用工具函式
  App.tsx
  main.tsx
  index.css
```

## 目前開發狀態

- 已建立 Vite + React + TypeScript + Tailwind CSS 專案。
- 已加入繁體中文 UI 文案。
- 已加入 top bar、左側元件控制、中央工作區、右側分析結果與底部圖表分析面板。
- 已加入 tab 導覽：元件結構、材料資料庫、電性分析、擴散與退火、氧化模擬、晶格視覺化、結果與匯出。
- 已加入第一版材料資料庫、分類篩選、材料列表、材料詳情與參數信心標示。
- 已加入第一版元件結構 Layer Stack 編輯器、材料選擇、2D 側視預覽與驗證提醒。
- 已加入 Sb 塊材底部源極 WSe₂ 上閘極元件模板與模板選擇器。
- 已加入第一版 3D 元件視覺化，可用目前 layer stack 產生幾何示意、切換視角、顯示標籤與爆炸圖模式。
- 已加入第一版製程流程 UI，可新增、複製、刪除、排序、編輯製程/量測步驟，並關聯目前元件材料層。
- 電性分析已加入第一版 I-V / Id-Vg 近似模型；氧化模擬已加入第一版 WOx / Sb₂O₃ / Raman 解釋模組。
- 結果與匯出已加入專案 JSON 匯出 / 匯入、Markdown 完整報告、實驗摘要與報告預覽。
- 晶格視覺化仍是占位與說明文字。

## Batch 2：材料資料庫

本批新增第一版材料資料庫，用於整理二維半導體元件常見材料與後續視覺化/近似分析所需的基礎參數欄位。

目前包含材料：

- 二維半導體與二維材料：WSe₂、MoS₂、WS₂、MoSe₂、MoTe₂、黑磷、石墨烯、hBN。
- 介電層與氧化物：Sb₂O₃、HfO₂、Al₂O₃、SiO₂、Si₃N₄、WOx、本徵氧化層。
- 金屬：Pd、Ti、Au、Cr、Ni、Pt、Al、Ag、Cu、Sc。
- 塊材與基板：Sb 塊材、石墨、Si。
- 自訂材料占位：自訂材料。

材料參數以三種狀態標示：

- `known`：已知或定性上相對明確的資料。
- `estimated`：估計值或常見近似值，不能視為精密定量資料。
- `unknown`：未知或需要文獻參數，後續物理計算不能直接使用。

目前資料庫不是完整文獻級材料資料庫。所有估計值與未知值都需要在後續批次加入文獻來源、樣品條件、製程條件與實驗校準後才能用於更嚴格的分析。

## Batch 2.5：UI 修正與製程架構預留

本批是 Batch 3 前的清理與架構準備。

- 已將 Batch 2 狀態建立本機 Git commit：`edc897d`。
- 改善材料資料庫捲動行為，材料清單與材料詳情面板可各自垂直捲動，減少整頁過度捲動。
- 新增金屬材料 In，並標記低熔點、Sb₂O₃ 介面反應、擴散與退火行為需要文獻與實驗校準。
- 調整頂部導覽版面：標題與副標題保留在第一列，`MVP 開發中` 保留右側，分頁導覽整合到第二列，避免與標題擠在同一行。
- 新增未來製程流程型別與資料樣板，包含金屬沉積、Sb₂O₃ 沉積、氧化處理、擴散退火、O₂ RIE、SEM、電子束微影、電性量測、低溫電性量測、Raman、低功率 Raman、PL、AFM、XPS。
- 目前只建立資料架構與樣板；尚未實作任何真實製程模擬、製程 UI、速率計算或實驗資料擬合。

## Batch 3：元件結構 Layer Stack 編輯器

本批新增第一版「元件結構」編輯器，用來建立幾何與材料堆疊模型，作為後續 3D 視覺化、製程流程與近似分析的資料基礎。

- 已加入可編輯的材料層清單，可新增、刪除、複製與上下移動材料層。
- 每個材料層可選擇材料資料庫中的材料，並設定角色、長寬厚度、位置、旋轉角度、偏壓標籤、可見性、透明度與備註。
- 已加入簡單 2D 側視堆疊預覽，使用材料資料庫顏色顯示材料層；厚度為視覺縮放，不代表真實比例。
- 已加入元件摘要與驗證提醒，例如缺少材料、厚度不合理、角色與材料分類可能不一致、缺少半導體通道或源極/汲極/閘極。
- 目前元件結構編輯器只用於建立幾何與材料堆疊模型，尚未進行真實 3D、電性、擴散或製程模擬。
- 使用者指定的 Sb 塊材 / Sb₂O₃ / WSe₂ / Pd / 上閘極元件模板已於 Batch 4 加入。

## Batch 4：Sb/WSe₂ 上閘極模板與材料介面整理

本批加入使用者指定的 Sb 塊材 / Sb₂O₃ / WSe₂ / Pd / 上閘極元件模板，並整理材料資料庫頁面的視覺密度。

- 新增模板系統與模板選擇器，可在「基礎二維半導體堆疊」與「Sb 塊材底部源極 WSe₂ 上閘極元件」之間切換。
- 新增 Sb/WSe₂ 上閘極模板：Sb 塊材作為底部平台與源極，局部 Sb₂O₃ 位於 Sb 表面，WSe₂ 作為通道，Pd 作為汲極接觸，上方 Sb₂O₃ 作為上閘極介電層，Au 作為可替換的初始上閘極金屬。
- 改善 2D 側視預覽，使用 `x_um` 與 `length_um` 近似顯示水平位置，讓局部氧化層、接觸金屬與上閘極更容易辨識。
- 補充元件驗證提醒，包含閘極下方介電層、Sb 表面氧化、Pd/WSe₂ 接觸、上閘極介電層過薄或過厚等提示。
- 整理材料資料庫 UI：新增搜尋、壓縮統計資訊、降低卡片與邊框密度，並將材料參數分為核心電子參數、輸運與電性、結構與熱參數、擴散參數。
- 目前仍未實作真實 3D、電性、擴散、氧化、製程模擬、能帶圖、真實圖表或匯出功能。

## Batch 5：3D 元件視覺化第一版

本批加入 Three.js / React Three Fiber / Drei，讓元件結構編輯器可把目前 layer stack 轉成 3D 矩形幾何示意。

- 已新增 3D viewer，會依照材料層的長度、寬度、厚度、位置、可見性、透明度與材料顏色繪製 3D 區塊。
- 已加入 OrbitControls，可旋轉、縮放與平移視角。
- 已加入視角按鈕：3D 視角、俯視圖、側視圖、前視圖與重設視角。
- 已加入爆炸圖模式，讓堆疊層之間有額外間距，方便檢查局部結構。
- 已加入 3D 標籤切換，可顯示材料層名稱、材料名稱與偏壓標籤。
- 厚度使用視覺縮放，避免單層 WSe₂ 消失，也避免 Sb 塊材厚度完全支配場景；此縮放不代表真實比例。
- 材料資料庫頁面也調整了垂直版面高度，材料清單與材料詳情面板會使用更多可用螢幕高度。
- 目前仍未實作真實電性、擴散、氧化、製程模擬、能帶圖、真實圖表、匯出或 polygon CAD。

## Batch 6：製程流程 UI 第一版

本批在「擴散與退火」分頁加入第一版製程流程工作區，名稱更新為「製程流程與退火擴散」。

- 已加入製程時間線，可新增、刪除、複製、上下移動與啟用/停用步驟。
- 已加入製程/量測樣板，包含金屬沉積、Sb₂O₃ 沉積、氧化處理、擴散退火、O₂ RIE、SEM、E-beam lithography、電性量測、低溫電性量測、Raman、低功率 Raman、PL、AFM、XPS 與自訂步驟。
- 已加入步驟參數編輯器，支援文字、數值、選單、布林切換與多行備註欄位。
- 已加入關聯材料層功能，可把製程或量測步驟連到目前元件結構中的材料層，例如 Pd 汲極、WSe₂ 通道或 Sb₂O₃ 介電層。
- 已加入預設 `Sb/WSe₂ 元件製程草稿`，作為使用者後續整理真實製程條件的起點。
- 已加入流程摘要與驗證提醒，例如缺少必要參數、金屬沉積未指定材料、退火缺少溫度/時間、D0/Ea 尚未填入、RIE 缺少功率/時間、Raman 高功率風險與 XPS 深度分析提醒。
- 目前製程流程僅用於記錄與組織實驗步驟，尚未進行真實製程、擴散、氧化、蝕刻、Raman/PL/XPS 解讀、AFM 形貌或電性量測模擬。
- 後續可在此基礎上加入退火擴散模型、氧化模型、Raman/PL/XPS 解讀與電性量測對照。

## Batch 6.7：材料層放置控制與接觸位置修正

本批改善「元件結構」頁面的材料層新增與幾何放置流程，讓使用者不必只靠 x/y 數字猜測位置。

- 修正基礎二維半導體堆疊中的 source/drain 接觸位置，讓接觸金屬預設會與 WSe₂ 通道重疊，而不是意外漂離通道。
- 新增「新增材料層」面板，可選擇材料、材料層角色、參考材料層、放置方式與初始尺寸。
- 新增常用放置方式：貼齊參考層、加在參考層上方/下方、置中於參考層、左/右側接觸金屬、源極接觸、汲極接觸、上閘極、上方介電層、局部氧化層與全寬底層。
- 在材料層設定中新增「快速放置」區，可對既有材料層套用放置方式，或快速執行靠左對齊、置中對齊、靠右對齊與符合參考層尺寸。
- 新增幾何說明文字，說明目前 x/y 位置是以元件中心為座標原點的示意位置。
- 新增驗證提醒：source/drain/contact 未與半導體通道重疊、gate 與通道水平重疊不足、局部氧化層可能未與主要材料層重疊等。
- 目前仍未實作 polygon CAD、真實 3D 製程形貌或任何物理計算；所有放置方式都是可再手動編輯的矩形示意幾何。

## Batch 7：退火 / 擴散近似模型第一版

本批在「擴散與退火」分頁新增「製程時間線 / 擴散估算」內部分頁，加入第一版 Arrhenius + Fick-like 擴散近似模型。

- 新增 Arrhenius 擴散係數計算：`D(T) = D0 exp(-Ea / kBT)`，Ea 使用 eV，kB 使用 eV/K。
- 新增 Fick-like 擴散長度估算，支援一維、二維與三維特徵長度。
- 新增 1D 正規化濃度曲線 SVG，用於顯示深度與濃度趨勢。
- 新增擴散情境 presets，包含 Pd、In、Ti、Au、Cr、Ni、Pt、Al、Cu、Ag 進入 Sb₂O₃，以及 O in WSe₂、Sb 表面氧化占位。
- 所有缺少文獻資料的 D0 / Ea 都維持 `null`，不假造精密擴散參數。
- 新增初始混入深度、界面障礙因子、晶界倍率與缺陷倍率，用於定性探索趨勢。
- 可選擇目前元件結構中的目標材料層，並比較估計受影響深度與目標層厚度。
- 可選擇製程時間線中的退火、金屬沉積或氧化步驟，嘗試帶入溫度、時間、擴散物種、host material、D0 與 Ea。
- UI 會清楚提醒：若 D0 或 Ea 缺失或只是估計值，結果只能作趨勢參考，不能視為定量預測。
- In 只被標示為候選緩衝金屬；是否降低 Sb₂O₃ 介面衝擊需要文獻與實驗驗證。
- 目前沒有真實界面化學、晶粒尺度模擬、3D 擴散雲、process-to-geometry 更新、TCAD、DFT 或 MD 模擬。

## Batch 8：氧化 / WOx / Raman 解釋模組

本批在「氧化模擬」分頁加入第一版氧化與 Raman 解釋模組，用於整理 WSe₂ → WOx、Sb → Sb₂O₃ 等氧化條件，並協助判斷為什麼氧化或 O₂ RIE 後 Raman 仍可能看到 WSe₂ 訊號。

- 新增 WSe₂ → WOx 定性 / 半定量氧化模型，可輸入氧化方法、時間、溫度、功率、氧氣濃度、濕度、初始厚度、氧化速率、氧化不均勻因子與製程損傷因子。
- 新增 Sb → Sb₂O₃ 表面氧化 interpretation，用於提醒 Sb 表面氧化層厚度與化學態需要 AFM/XPS 或製程校準。
- 新增氧化預設情境：WSe₂ → WOx：O₂ RIE、UV ozone、熱氧化、環境暴露，以及 Sb → Sb₂O₃ 環境暴露 / 熱氧化和通用二維材料電漿氧化。
- 新增 Raman 可見性啟發式判斷，用殘留厚度、Raman 探測深度與氧化不均勻性推估 WSe₂ Raman 是否可能仍可見、變弱或不明顯。
- 新增 Raman 解釋排序，列出表面只氧化、殘留 WSe₂、氧化不均、Raman 探測下層材料、WOx 訊號較弱、峰位重疊、RIE 缺陷等可能原因。
- 可選擇目前元件結構中的目標材料層，例如 WSe₂ 通道或 Sb 塊材，並以該層厚度作為初始厚度參考。
- 可選擇製程時間線中的氧化、RIE、退火或相關自訂步驟，嘗試帶入時間、溫度、功率、氧氣濃度、濕度、初始材料與目標氧化物。
- UI 會清楚提醒：缺少氧化速率、Raman 探測深度或材料吸收參數時，結果只能作趨勢判讀，不能視為定量預測。
- 目前沒有真實反應動力學、Raman 強度計算、XPS 光譜擬合、製程結果回寫幾何、TCAD、DFT 或 MD 模擬；氧化速率需要未來文獻或實驗校準。

## Batch 9：電性模型與 I-V / Id-Vg 近似分析

本批在「電性分析」分頁加入第一版電性近似模組，用於從目前元件 layer stack 與手動參數估算 gate capacitance、載子密度、通道電阻與簡化 I-V / Id-Vg 趨勢。

- 新增 gate capacitance 近似：`Cox = ε0 k / tox`，用於估算閘極介電層單位面積電容。
- 新增 gate-induced carrier density 近似：以 `Cox(Vg - Vth) / q` 估算簡化載子密度。
- 新增 WSe₂ / 二維通道電阻近似，使用通道長寬、遷移率與載子密度估算 drift resistance。
- 新增總電阻估算，可包含手動輸入的 source/drain contact resistance。
- 新增 SVG Id-Vd 與 Id-Vg 趨勢圖，支援線性與半對數顯示。
- 新增介電層電場與 breakdown risk 啟發式提醒。
- 新增定性 band alignment / contact warning preview，提醒功函數本身不能決定真實二維材料接觸。
- 可從目前元件結構讀取 channel、source、drain、gate 與 gate dielectric layers，並帶入通道尺寸、介電層厚度與材料資料庫中的候選參數。
- 可連結製程流程中的電性量測或低溫電性量測步驟，嘗試帶入 Vd/Vg 掃描範圍與溫度。
- UI 會提醒 contact resistance、Fermi-level pinning、界面態、缺陷、穿隧、介電層漏電/崩潰、缺少 mobility、缺少介電常數與低溫 transport 尚未建模等限制。
- 目前沒有完整 TCAD、NEGF、DFT、真實 Schottky transport、trap/hysteresis model、measured data fitting 或低溫輸運模型；接觸電阻必須由實驗校準。

## Batch 10：專案儲存 / 載入與 Markdown 報告匯出

本批在「結果與匯出」分頁加入第一版本機儲存、載入與報告產生功能，方便把目前設計整理成可追蹤的研究紀錄。

- 新增專案 metadata 編輯器，可填寫專案名稱、樣品名稱、研究者、單位 / 實驗室、標籤與備註。
- 新增專案 JSON 匯出，可保存目前元件結構、製程流程、metadata 與匯出警告。
- 新增專案 JSON 匯入，可還原元件結構、製程流程與 metadata；匯入前會提醒目前狀態將被取代。
- 新增 Markdown 完整報告匯出，整理元件結構、材料堆疊、製程流程、擴散 / 氧化 / 電性模組狀態、主要警告與後續建議。
- 新增輕量實驗摘要匯出，適合快速記錄樣品、製程步驟、主要風險與下一步量測建議。
- 新增報告預覽與複製 Markdown 報告功能。
- 目前所有匯出與匯入都在瀏覽器端完成，沒有後端資料庫、雲端同步、帳號系統或 PDF 匯出。
- 目前擴散、氧化與電性模組的即時情境狀態尚未完全提升到全域專案狀態，因此 JSON / 報告會清楚標示部分即時模組狀態尚未納入匯出；後續批次可強化跨模組狀態保存與還原。
- 自動產生的 Markdown 報告是研究紀錄草稿，不是最終科學證明；所有未經文獻與實驗校準的參數不可視為定量結論。

## Batch 11：量測資料匯入與比較第一版

本批新增「量測資料」分頁，用於整理 Raman、PL 與電性量測資料，並進行初步視覺化與 before/after 比較。

- 新增 measured data type system，包含量測類型、欄位類型、metadata、資料列、series 與 comparison。
- 新增 CSV / TXT / DAT 與手動貼上資料匯入，支援自動偵測逗號、Tab、空白與分號分隔。
- 新增欄位對應器，可把原始欄位標成 Raman shift、wavelength、energy、intensity、voltage、current、temperature、time 或 custom。
- 新增資料集清單，可選擇、複製與刪除本機量測資料集。
- 新增 metadata 編輯器，可記錄樣品、條件、before/after 標籤、儀器、操作者、日期、雷射波長、雷射功率、積分時間、溫度與備註。
- 新增材料層與製程步驟關聯，可把 Raman、PL 或電性資料連到目前 device layers 與 process steps。
- 新增資料預覽表格，顯示前 20 筆資料並提醒非數值欄位與單位不明風險。
- 新增簡單 SVG plot，可快速繪製 Raman / PL / electrical line plot，並支援同類型資料集疊圖、abs(I) 與 log10(Y) 顯示。
- 新增 before/after comparison panel，可儲存同類型資料集比較，並顯示 Raman、PL、電性資料的判讀提醒。
- JSON 匯出已整合量測資料集與量測比較；Markdown 報告會加入量測資料摘要與比較摘要，但不嵌入完整原始資料表。
- 目前沒有 Origin binary parser、Excel parser、baseline correction、smoothing、peak fitting、Raman mode assignment、PL quantum yield、electrical fitting、TLM fitting、XPS fitting 或 publication-grade analysis。

## Batch 12：量測資料基本處理工具

本批在「量測資料」分頁加入第一版非破壞式資料處理工具，讓使用者可以保留原始資料，同時建立處理後資料集供視覺化與比較。

- 新增 abs(I) 與 Y 取負號處理，協助電性資料進行 log plot 或電流大小比較，但 UI 會提醒必須確認接線方向、掃描方向與物理問題。
- 新增正規化工具：以最大值正規化、Min-Max 正規化與面積正規化。
- 新增簡單 baseline 工具：扣除常數 baseline 與扣除線性 baseline。
- 新增 processing pipeline，每個處理步驟可啟用 / 停用、移除、排序，並保留處理歷史。
- 新增處理後資料集與處理後資料預覽，原始資料不會被覆蓋。
- 新增手動 peak marker，可輸入 x 值、label、assignment 與 notes。
- 新增簡單 local maximum auto peak suggestion，可設定 threshold、minimum separation 與最多建議數量。
- 更新快速 SVG plot，可疊加原始資料與處理後資料，並顯示 peak marker 垂直標線。
- JSON 匯出已整合 processed measurement datasets 與 peak markers。
- Markdown 報告新增「量測資料處理摘要」，列出 source dataset、處理步驟、警告與 peak marker 表格。
- 目前沒有 Lorentzian / Gaussian / Voigt fitting、正式 baseline algorithm validation、smoothing、Raman mode assignment、PL quantum yield、electrical fitting、TLM fitting、XPS fitting 或 publication-grade analysis。
- 所有資料處理都應標示處理步驟並保留原始資料；處理後圖形不可直接視為定量結論。

## Batch 13：文獻資料庫與 UI 資訊架構重整

本批先整理 app 的資訊架構與文獻來源基礎，不新增新的物理分析模組。

- 新增「文獻資料庫」分頁，用於管理文獻候選來源、材料/製程參數證據與衝突 / 共識整理。
- 新增文獻型別系統，區分 review status、agreement status、source type、parameter evidence 與 conflict group。
- 新增 placeholder 文獻來源與 qualitative conflict group，皆清楚標示為待補候選資料，不含未驗證 DOI 或可信數值。
- 將材料 notes 與文獻來源分離；材料詳情頁新增可收合的「文獻來源」區，顯示相關證據數、候選/已檢閱/已驗證狀態與衝突整理。
- 新增共用 collapsible / acknowledged notice 元件，讓警告、模型假設、缺少參數、文獻來源與提醒可以預設收合，並支援標示已讀。
- 將元件結構、材料資料庫、擴散估算、氧化模擬與電性分析中的重要限制說明改為較不佔空間的可展開提醒。
- 改善新增材料層回饋：新增後會自動選取、在材料層清單中高亮，並顯示放置方式與快速對齊動作。
- JSON / Markdown 匯出新增文獻資料庫摘要，方便追蹤候選來源、參數證據與衝突整理數量。
- 目前尚未實作文獻自動搜尋、DOI 查詢、PDF 解析、自動參數升級、後端資料庫或雲端同步。
- placeholder 文獻不是正式引用；任何材料參數仍需人工審核、文獻校準與實驗驗證。

## Batch 14：文獻資料匯入 / 審核流程與材料參數待查清單

本批把文獻資料庫從候選資料展示升級為第一版可操作的資料輸入、審核與匯入/匯出工作流。

- 新增材料參數待查清單，涵蓋 WSe₂、Sb₂O₃、Sb bulk、Pd、In、WOx，以及 Ti、Au、Cr、Ni、Pt、Al、Ag、Cu、Sc、HfO₂、Al₂O₃、SiO₂、hBN、MoS₂、WS₂、MoSe₂、MoTe₂、graphene、black phosphorus 等材料。
- 高優先材料包含 band gap、electron affinity、mobility、dielectric constant、breakdown field、D0、Ea、oxidation rate、Raman visibility、contact behavior 等待查項目。
- 新增文獻來源 editor，可輸入 title、authors、year、source type、journal、DOI、URL、review status、tags 與 notes。
- 新增參數證據 editor，可輸入 source、materials、parameter key、value、unit、condition、method、agreement status、confidence、summary、applicability 與 warnings；value 可為 `null`，支援 qualitative claim。
- 新增衝突 / 共識 editor，可整理 evidence IDs、agreement counts、summary、recommended status、recommended value 與 warnings。
- 新增推薦參數 panel，可從 conflict group 建立 draft recommendation，並標示 reviewed、ready to promote 或 rejected；本批不會自動寫入 `materials.ts`。
- 新增文獻資料庫 JSON 匯入 / 匯出，以及 TODO list / evidence summary Markdown 匯出。
- Material Detail 的文獻來源區升級為 compact summary，顯示 TODO、evidence、conflict group 與 recommendation counts，並預設收合。
- Project JSON / Markdown report 會包含 literature database、TODO 與 recommendation 摘要。
- 目前沒有 automatic web search、DOI lookup、PDF parsing、automatic parameter promotion、backend database 或 cloud sync。
- seed records 都是 placeholder / candidate，必須人工審核與實驗條件比對後才可作為正式參數候選。

## Batch 15A：第一批文獻種子資料與材料參數候選集

本批加入第一批由使用者指定、具有 DOI 的文獻種子資料，並建立材料參數候選證據與衝突整理；所有資料仍維持 candidate / draft 狀態，不會自動寫入正式材料資料庫。

- 新增 WSe₂ PL / Raman 候選來源：Tonndorf et al. 2013，用於後續 Raman / PL peak 標記與光譜解釋資料整理。
- 新增 WSe₂ band gap / electrical properties 候選來源：Zhou 2015，作為 bulk / monolayer band gap 條件依賴的候選證據。
- 新增 WSe₂ 表面氧化 / WOx / Raman / PL 候選來源：Li 2016，用於氧化後 Raman 仍可見的定性解釋與氧化模組校準待查。
- 新增 Sb₂O₃ high-k / wide band gap 候選來源：Messalea 2021，以及 Sb₂O₃ breakdown 候選來源，用於 dielectric constant、band gap 與 breakdown field 的後續人工審核。
- 新增 WSe₂ contact / Fermi-level pinning 候選來源，提醒 Pd/WSe₂ 或其他金屬接觸不可只用 work function 推論為 ideal ohmic。
- In/Sb₂O₃ 仍維持待查 placeholder；目前只記錄「候選緩衝金屬」議題，不宣稱已證實可降低目前結構的界面衝擊。
- 更新文獻資料庫 UI，加入「第一批文獻種子資料」摘要、真實來源 / placeholder 篩選，以及 TODO 是否已有候選證據的篩選。
- 更新 Markdown 報告文獻摘要，列出真實來源數、placeholder 來源數、review status、材料證據分布與推薦參數數量。
- 本批未執行 automatic web search、DOI lookup、PDF parsing，也未自動 promotion 到 `materials.ts`；所有 candidate values 仍需人工審核、條件比對與實驗校準。

## 科學準確性聲明

本工具目前是「物理導向的視覺化與近似分析工具」，不是完整 TCAD、DFT 或分子動力學模擬器。所有計算結果都需要搭配實驗資料與文獻參數判讀；在未來加入任何模型或公式時，也應清楚標註假設、適用範圍與限制。
