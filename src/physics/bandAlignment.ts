// 金屬 / 半導體能帶排列輔助計算。
//
// 物理機制與參考文獻：
// 1. Schottky–Mott 規則與 Fermi-level pinning（線性內插模型）：
//    S. M. Sze & K. K. Ng, Physics of Semiconductor Devices, 3rd ed., Wiley (2007), Ch. 3。
// 2. 二維半導體金屬接觸的 pinning 行為與限制：
//    A. Allain, J. Kang, K. Banerjee, A. Kis, "Electrical contacts to two-dimensional
//    semiconductors", Nature Materials 14, 1195–1205 (2015), DOI: 10.1038/nmat4452。
//    S. Das, H.-Y. Chen, A. V. Penumatcha, J. Appenzeller, Nano Letters 13, 100–105 (2013),
//    DOI: 10.1021/nl303583v（Sc/MoS₂，實測 pinning）。
//    C. Kim et al., ACS Nano 11, 1588–1596 (2017), DOI: 10.1021/acsnano.6b07159
//    （單層 MoS₂ / MoTe₂ pinning factor 實測約 0.11 / −0.07）。
//
// 注意：此模組只提供理想化 / 半經驗估算。真實二維材料接觸常由界面態、
// 金屬誘發能隙態（MIGS）、缺陷與製程污染主導，pinning factor 必須由實驗取得。

export interface SchottkyBarrierEstimate {
  /** 電子障礙高度 φBn (eV)，理想 Schottky–Mott：φBn = Φm − χ */
  electronBarrier_eV: number | null
  /** 電洞障礙高度 φBp (eV)：φBp = Eg − φBn */
  holeBarrier_eV: number | null
  /** 是否套用 pinning 修正 */
  pinningApplied: boolean
  warnings_zh: string[]
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * 理想 Schottky–Mott 規則：φBn = Φm − χ。
 * 參考：Sze & Ng (2007), Ch. 3。
 */
export function calculateSchottkyMottBarrier(
  metalWorkFunction_eV: number | null,
  electronAffinity_eV: number | null,
): number | null {
  if (!isFiniteNumber(metalWorkFunction_eV) || !isFiniteNumber(electronAffinity_eV)) {
    return null
  }

  return metalWorkFunction_eV - electronAffinity_eV
}

/**
 * 含 Fermi-level pinning 的線性內插模型：
 *   φBn = S·(Φm − Φ_CNL) + (Φ_CNL − χ)
 * 其中 S 為 pinning factor（S = 1 回到 Schottky–Mott，S → 0 完全 pinning），
 * Φ_CNL 為電荷中性能階（相對真空，eV）。
 * 參考：Sze & Ng (2007), Ch. 3；Kim et al., ACS Nano 11, 1588 (2017)。
 */
export function calculatePinnedBarrier(
  metalWorkFunction_eV: number | null,
  electronAffinity_eV: number | null,
  pinningFactor: number | null,
  chargeNeutralityLevel_eV: number | null,
): number | null {
  if (
    !isFiniteNumber(metalWorkFunction_eV) ||
    !isFiniteNumber(electronAffinity_eV) ||
    !isFiniteNumber(pinningFactor) ||
    !isFiniteNumber(chargeNeutralityLevel_eV)
  ) {
    return null
  }

  return (
    pinningFactor * (metalWorkFunction_eV - chargeNeutralityLevel_eV) +
    (chargeNeutralityLevel_eV - electronAffinity_eV)
  )
}

export function estimateSchottkyBarrier({
  metalWorkFunction_eV,
  electronAffinity_eV,
  bandGap_eV,
  pinningFactor = null,
  chargeNeutralityLevel_eV = null,
}: {
  metalWorkFunction_eV: number | null
  electronAffinity_eV: number | null
  bandGap_eV: number | null
  pinningFactor?: number | null
  chargeNeutralityLevel_eV?: number | null
}): SchottkyBarrierEstimate {
  const warnings_zh: string[] = []
  const usePinning =
    isFiniteNumber(pinningFactor) && isFiniteNumber(chargeNeutralityLevel_eV)

  const electronBarrier_eV = usePinning
    ? calculatePinnedBarrier(
        metalWorkFunction_eV,
        electronAffinity_eV,
        pinningFactor,
        chargeNeutralityLevel_eV,
      )
    : calculateSchottkyMottBarrier(metalWorkFunction_eV, electronAffinity_eV)

  if (electronBarrier_eV !== null && isFiniteNumber(bandGap_eV)) {
    if (electronBarrier_eV < 0) {
      warnings_zh.push(
        '估算電子障礙為負值，理想模型下可能形成電子側近似無障礙接觸；實際仍可能被界面態主導。',
      )
    }

    if (electronBarrier_eV > bandGap_eV) {
      warnings_zh.push(
        '估算電子障礙超過能隙，理想模型下費米能階會落在價帶側；實務上請改以電洞障礙判讀。',
      )
    }
  }

  const holeBarrier_eV =
    electronBarrier_eV !== null && isFiniteNumber(bandGap_eV)
      ? bandGap_eV - electronBarrier_eV
      : null

  if (!usePinning) {
    warnings_zh.push(
      '使用理想 Schottky–Mott 規則（未套用 pinning）。實測二維材料 pinning factor 常遠小於 1（例如單層 MoS₂ 約 0.11，Kim et al. 2017），功函數本身不能決定真實接觸。',
    )
  } else {
    warnings_zh.push(
      'pinning factor 與電荷中性能階為半經驗參數，需由該材料系統實測（如 Kim et al. 2017）取得，不可跨材料直接沿用。',
    )
  }

  return {
    electronBarrier_eV,
    holeBarrier_eV,
    pinningApplied: usePinning,
    warnings_zh,
  }
}

/**
 * Cowley–Sze 介面態斜率參數 S：
 *   S = 1 / (1 + q² · δ · D_it / (ε0 · ε_i))
 * D_it 單位 cm⁻²·eV⁻¹，δ 為界面層厚度 (nm)，ε_i 為界面層相對介電常數。
 * S → 1 為理想 Schottky–Mott；S → 0 為完全 pinning（Bardeen 極限）。
 * 參考：A. M. Cowley & S. M. Sze, J. Appl. Phys. 36, 3212 (1965),
 *   DOI: 10.1063/1.1702952；R. T. Tung, Appl. Phys. Rev. 1, 011304 (2014),
 *   DOI: 10.1063/1.4858400。
 */
export function pinningFactorFromDit(
  dit_cm2eV: number,
  delta_nm = 0.5,
  epsilonInterface = 3,
): number {
  if (!Number.isFinite(dit_cm2eV) || dit_cm2eV < 0) return 1
  const q = 1.602176634e-19
  const eps0 = 8.8541878128e-12
  const delta_m = delta_nm * 1e-9
  const dit_m2J = dit_cm2eV * 1e4 / q // cm⁻²eV⁻¹ → m⁻²J⁻¹
  const denom = 1 + (q * q * delta_m * dit_m2J) / (eps0 * epsilonInterface)
  return 1 / denom
}
