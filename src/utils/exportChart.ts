// 將能帶圖 SVG 匯出成獨立 SVG / PNG（供論文使用）。
// 因圖表依賴外部 CSS class，匯出時內嵌一份必要樣式，確保獨立檔案可正確顯示。
const CHART_CSS = `
.band-plot-bg{fill:#0d1320;stroke:rgba(255,255,255,0.08)}
.band-grid-line{stroke:rgba(255,255,255,0.06)}
.band-curve{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:2}
.band-curve.conduction{stroke:#22d3ee}
.band-curve.valence{stroke:#a78bfa}
.band-fermi-line{stroke:#facc15;stroke-width:1.6;stroke-dasharray:5 6}
.band-fermi-line.semi{stroke-dasharray:2 3;opacity:.7}
.band-tick-label{fill:#9aa4b2;font-size:13px;font-family:sans-serif}
.band-axis-label{fill:#9aa4b2;font-family:sans-serif}
.band-region-label{fill:#8a94a6;font-size:15px;font-weight:600;font-family:sans-serif}
.band-interface-line{stroke:rgba(255,255,255,0.18);stroke-dasharray:3 4}
.band-curve-tag{font-size:14px;font-weight:600;font-family:monospace}
.band-curve-tag.ec{fill:#22d3ee}.band-curve-tag.ev{fill:#a78bfa}.band-curve-tag.fermi{fill:#facc15}
.band-gap-fill{fill:rgba(167,139,250,0.10)}
.band-gap-label{fill:#8a94a6;font-size:13px;font-family:monospace}
.band-vac-line{stroke:#94a3b8;stroke-width:1.4;stroke-dasharray:6 5}
.band-col-sep{stroke:rgba(255,255,255,0.07)}
.band-metal-fill{fill:rgba(203,213,225,0.16)}
.band-metal-region{fill:rgba(148,163,184,0.10)}
.band-stack-val{font-size:11px;font-family:monospace;fill:#8a94a6}
.band-stack-val.ec{fill:#22d3ee}.band-stack-val.ev{fill:#a78bfa}
.band-stack-label{font-size:13px;font-weight:600;fill:#e5e7eb;font-family:sans-serif}
.band-stack-sub{font-size:11px;fill:#8a94a6;font-family:sans-serif}
.band-stack-na{font-size:12px;fill:#64748b;font-family:sans-serif}
`

function serialize(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('style', 'background:#0a0f17')
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = CHART_CSS
  clone.insertBefore(style, clone.firstChild)
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(clone)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadChartSvg(svg: SVGSVGElement | null, filename: string) {
  if (!svg) return
  triggerDownload(new Blob([serialize(svg)], { type: 'image/svg+xml' }), `${filename}.svg`)
}

export function downloadChartPng(svg: SVGSVGElement | null, filename: string, scale = 2) {
  if (!svg) return
  const source = serialize(svg)
  const vb = svg.viewBox.baseVal
  const w = (vb && vb.width) || svg.clientWidth || 880
  const h = (vb && vb.height) || svg.clientHeight || 520
  const img = new Image()
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#0a0f17'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)
    canvas.toBlob((blob) => {
      if (blob) triggerDownload(blob, `${filename}.png`)
    }, 'image/png')
  }
  img.src = url
}
