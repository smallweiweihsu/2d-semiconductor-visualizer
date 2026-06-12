// 共用物理常數（CODATA 2018 定義值 / 推薦值）。
// 參考：S. M. Sze & K. K. Ng, Physics of Semiconductor Devices, 3rd ed., Wiley (2007), Appendix。

export const physicsConstants = {
  /** 基本電荷 (C) */
  q_C: 1.602176634e-19,
  /** Boltzmann 常數 (J/K) */
  kB_J_per_K: 1.380649e-23,
  /** Boltzmann 常數 (eV/K) */
  kB_eV_per_K: 8.617333262e-5,
  /** 真空介電常數 (F/m) */
  epsilon0_F_per_m: 8.8541878128e-12,
  /** Planck 常數 (J·s) */
  h_Js: 6.62607015e-34,
  /** 約化 Planck 常數 (J·s) */
  hbar_Js: 1.054571817e-34,
  /** 自由電子質量 (kg) */
  m0_kg: 9.1093837015e-31,
  /**
   * 自由電子 Richardson 常數 A* = 4π q m0 kB² / h³ ≈ 120 A·cm⁻²·K⁻²。
   * 實際材料需乘上有效質量比 (m* 除以 m0)。
   */
  richardsonConstant_A_per_cm2K2: 120,
} as const

/** 熱電壓 kB·T/q (V)。T 需為 Kelvin。 */
export function thermalVoltage_V(temperature_K: number): number | null {
  if (!Number.isFinite(temperature_K) || temperature_K <= 0) {
    return null
  }

  return physicsConstants.kB_eV_per_K * temperature_K
}
