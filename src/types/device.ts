export interface DeviceLayer {
  id: string
  materialId: string
  thicknessNm?: number
}

export interface DeviceTemplate {
  id: string
  name: string
  layers: DeviceLayer[]
}
