import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const defaultReferenceBase = 'https://semiviz2d-cfdeom2b.manus.space'
const defaultCurrentBase = process.env.CURRENT_BASE_URL ?? 'https://2d-semiconductor-visualizer.vercel.app'
const referenceBase = process.env.MANUS_BASE_URL ?? defaultReferenceBase
const currentBase = process.argv.find((arg) => arg.startsWith('--current='))?.split('=')[1] ?? defaultCurrentBase
const artifactDir = path.join(process.cwd(), 'test-artifacts')
const viewport = { width: 1440, height: 1000 }

const routes = [
  { slug: 'device-builder', path: '/device-builder' },
  { slug: 'band-diagram', path: '/band-diagram' },
  { slug: 'iv-simulator', path: '/iv-simulator' },
  { slug: 'references', path: '/references' },
  { slug: 'research-notes', path: '/research-notes' },
]

await mkdir(artifactDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const referencePage = await browser.newPage({ viewport })
const currentPage = await browser.newPage({ viewport })

const referenceMetrics = {}
const currentMetrics = {}

for (const route of routes) {
  referenceMetrics[route.slug] = await captureRoute(referencePage, referenceBase, route, 'manus')
  currentMetrics[route.slug] = await captureRoute(currentPage, currentBase, route, 'current')
  await createSideBySide(route.slug)
}

const bandInternalMetrics = {
  referenceBase,
  currentBase,
  manus: await captureBandInternal(referencePage, referenceBase, 'manus'),
  current: await captureBandInternal(currentPage, currentBase, 'current'),
}
bandInternalMetrics.diff = diffMetrics({ band: bandInternalMetrics.manus }, { band: bandInternalMetrics.current }).band
await writeJson('band-diagram-internal-metrics.json', bandInternalMetrics)
await createBandInternalSideBySide()

const diff = diffMetrics(referenceMetrics, currentMetrics)
await writeJson('manus-style-metrics.json', referenceMetrics)
await writeJson('current-style-metrics.json', currentMetrics)
await writeJson('style-metrics-diff.json', diff)

await browser.close()

console.log(JSON.stringify({
  referenceBase,
  currentBase,
  files: [
    'test-artifacts/manus-style-metrics.json',
    'test-artifacts/current-style-metrics.json',
    'test-artifacts/style-metrics-diff.json',
    'test-artifacts/band-diagram-internal-metrics.json',
  ],
}, null, 2))

async function captureRoute(page, baseUrl, route, prefix) {
  await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(async () => {
    await page.goto(`${baseUrl}${route.path}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  })
  await page.waitForTimeout(900)
  const screenshotPath = path.join(artifactDir, `${prefix}-${route.slug}-metrics.png`)
  await page.screenshot({ path: screenshotPath, fullPage: true })

  return page.evaluate((slug) => {
    const round = (value) => Math.round(value * 100) / 100
    const roundRect = (rectangle) => Object.fromEntries(Object.entries(rectangle).map(([key, value]) => [key, round(value)]))
    const pick = (...selectors) => selectors.map((selector) => document.querySelector(selector)).find(Boolean) ?? null
    const pickAll = (...selectors) => selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)))
    const findText = (text) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        if (node.nodeValue?.includes(text)) return node.parentElement
        node = walker.nextNode()
      }
      return null
    }
    const panelFromText = (text, options = {}) => {
      const anchor = findText(text)
      let element = anchor
      let best = null
      while (element && element !== document.body) {
        const box = element.getBoundingClientRect()
        const tallEnough = box.height >= (options.minHeight ?? 280)
        const wideEnough = box.width >= (options.minWidth ?? 180)
        const narrowEnough = options.maxWidth === undefined || box.width <= options.maxWidth
        if (tallEnough && wideEnough && narrowEnough) best = element
        element = element.parentElement
      }
      return best
    }
    const cardFromText = (text) => {
      const anchor = findText(text)
      let element = anchor
      while (element && element !== document.body) {
        const box = element.getBoundingClientRect()
        if (box.width >= 300 && box.height >= 250 && /border|card|rounded|manus-chart-card|manus-card/.test(String(element.className))) {
          return element
        }
        element = element.parentElement
      }
      return panelFromText(text, { minHeight: 250, minWidth: 300 })
    }
    const rect = (element) => {
      if (!element) return null
      const { x, y, width, height, top, right, bottom, left } = element.getBoundingClientRect()
      return roundRect({ x, y, width, height, top, right, bottom, left })
    }
    const style = (element, props) => {
      if (!element) return {}
      const computed = getComputedStyle(element)
      return Object.fromEntries(props.map((prop) => [prop, computed.getPropertyValue(prop)]))
    }
    const textStyle = (element) => style(element, ['font-family', 'font-size', 'font-weight', 'line-height', 'color'])
    const firstVisible = (elements) => elements.find((element) => {
      const box = element.getBoundingClientRect()
      return box.width > 1 && box.height > 1
    }) ?? null
    const row = firstVisible(pickAll('.manus-list-row', '.material-select-row', '.process-row', '.paper-select-row', '.template-panel'))
    const activeRow = firstVisible(pickAll('.manus-list-row.active', '.material-select-row.active', '.paper-select-row.active', '.template-panel.active', '.active-device-card'))
    const chartCard = firstVisible(pickAll('.manus-chart-card', '.band-diagram-preview', '.manus-card:has(svg)', '[class*="chart"]'))
      ?? cardFromText(slug === 'band-diagram' ? 'Energy Band Diagram' : slug === 'iv-simulator' ? 'Transfer Curve' : '')
    const plot = firstVisible(pickAll('svg.recharts-surface', '.band-diagram-preview svg', '.manus-chart-card svg'))
    const sideLeft = pick('.manus-three-left', '.manus-split-list', '.pane-list', '.band-selector-panel', '.hypothesis-list')
      ?? panelFromText(slug === 'band-diagram' ? '材料選擇' : slug === 'iv-simulator' ? '模擬參數' : slug === 'references' ? '文獻來源' : slug === 'research-notes' ? '研究假說' : 'Layer Stack', { maxWidth: 420 })
    const sideRight = pick('.manus-three-right', '.inspector-card', '.band-parameter-panel')
      ?? panelFromText(slug === 'band-diagram' ? '能帶參數' : slug === 'iv-simulator' ? '分析結果' : 'Properties', { maxWidth: 420 })
    const center = pick('.manus-three-center', '.viewport-card', '.manus-split-main', '.hypothesis-detail')
      ?? cardFromText(slug === 'band-diagram' ? 'Energy Band Diagram' : slug === 'iv-simulator' ? 'Transfer Curve' : slug === 'references' ? 'Reliability score' : slug === 'research-notes' ? '描述' : '3D')
    const search = pick('.manus-search', 'input[placeholder*="搜尋"]')
    const topbarButton = firstVisible(pickAll('.manus-topbar button', '.manus-actions button'))
    const badge = firstVisible(pickAll('.manus-status-badge', '.confidence-badge', '[class*="badge"]'))
    const navItem = firstVisible(pickAll('.manus-nav a', 'nav a'))
    const viewModeButton = firstVisible(pickAll('.view-tabs button'))
    const viewportStage = pick('.large-device-stage', '[data-testid="device-viewport3d"]')

    const metrics = {
      route: slug,
      global: {
        body: style(document.body, ['font-family', 'font-size', 'line-height', 'background-color']),
        sidebar: rect(pick('.manus-sidebar', 'aside')),
        topbar: rect(pick('.manus-topbar', 'header')),
        content: rect(pick('.manus-main', 'main')),
        navItem: rect(navItem),
        navItemText: textStyle(navItem),
        search: rect(search),
        searchText: textStyle(search?.querySelector('input') ?? search),
        topbarButton: rect(topbarButton),
        topbarButtonStyle: style(topbarButton, ['padding-left', 'padding-right', 'font-size', 'border-radius']),
      },
      panels: {
        left: rect(sideLeft),
        right: rect(sideRight),
        center: rect(center),
        card: rect(pick('.manus-card', '.manus-chart-card')),
        cardStyle: style(pick('.manus-card', '.manus-chart-card'), ['border-radius', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'background-color', 'border-color']),
        row: rect(row),
        activeRow: rect(activeRow),
        activeRowStyle: style(activeRow, ['background-color', 'border-color', 'border-radius']),
        rowTitle: textStyle(row?.querySelector('strong') ?? row),
        rowSubtitle: textStyle(row?.querySelector('small') ?? row),
        badge: rect(badge),
        badgeStyle: style(badge, ['font-size', 'line-height', 'padding-left', 'padding-right', 'border-radius']),
      },
      charts: {
        card: rect(chartCard),
        plot: rect(plot),
        title: textStyle(pick('.manus-chart-card h2', '.band-diagram-preview header strong', '.manus-card > header')),
        ticks: textStyle(firstVisible(pickAll('.recharts-cartesian-axis-tick text', '.band-diagram-preview text'))),
        gridLine: style(firstVisible(pickAll('.recharts-cartesian-grid line', '.band-diagram-preview line')), ['stroke', 'stroke-width']),
        line: style(firstVisible(pickAll('.recharts-line-curve', '.band-diagram-preview path')), ['stroke', 'stroke-width']),
      },
      deviceBuilder: {
        layerStackPanel: rect(pick('.pane-list')),
        layerRow: rect(firstVisible(pickAll('.layer-row', '.template-panel', '.manus-list-row'))),
        viewportToolbar: rect(pick('.viewport-toolbar', '.view-tabs')),
        viewportStage: rect(viewportStage),
        propertiesPanel: rect(pick('.inspector-card')),
        propertyLabel: textStyle(firstVisible(pickAll('.layer-property-editor label', '.inspector-card label'))),
        canvas: rect(pick('[data-testid="device-viewport3d"] canvas', 'canvas')),
        selectedLayerRow: rect(firstVisible(pickAll('.layer-row.active', '.template-panel.active', '.selected-material'))),
        viewModeButton: rect(viewModeButton),
      },
      bandDiagram: {
        selector: rect(pick('.manus-three-left', '.band-selector-panel') ?? panelFromText('材料選擇', { maxWidth: 420 })),
        chartCard: rect(chartCard),
        svg: rect(pick('.band-diagram-preview svg', 'svg')),
        parameterPanel: rect(pick('.manus-three-right', '.band-parameter-panel') ?? panelFromText('能帶參數', { maxWidth: 420 })),
        metalRow: rect(row),
        modeButton: rect(firstVisible(pickAll('.segmented-vertical button'))),
      },
    }

    return metrics
  }, route.slug)
}

async function createSideBySide(slug) {
  const page = await browser.newPage({ viewport: { width: 2880, height: 1000 } })
  const manuscriptImage = await pngDataUrl(path.join(artifactDir, `manus-${slug}-metrics.png`))
  const currentImage = await pngDataUrl(path.join(artifactDir, `current-${slug}-metrics.png`))
  await page.setContent(`
    <style>
      body{margin:0;background:#05080d;color:#d8e4f0;font:14px Inter,Arial,sans-serif}
      .wrap{display:grid;grid-template-columns:1fr 1fr;gap:0}
      figure{margin:0;border-right:1px solid #22303c}
      figcaption{position:fixed;top:8px;margin-left:8px;background:#08131c;padding:6px 10px;border:1px solid #22303c;border-radius:6px}
      img{width:100%;display:block}
    </style>
    <div class="wrap">
      <figure><figcaption>Manus ${slug}</figcaption><img src="${manuscriptImage}" /></figure>
      <figure><figcaption>Current ${slug}</figcaption><img src="${currentImage}" /></figure>
    </div>
  `)
  await waitForImages(page)
  await page.screenshot({ path: path.join(artifactDir, `compare-${slug}.png`), fullPage: true })
  await page.close()
}

async function createBandInternalSideBySide() {
  const page = await browser.newPage({ viewport: { width: 2880, height: 1000 } })
  const manuscriptImage = await pngDataUrl(path.join(artifactDir, 'manus-band-diagram-internal.png'))
  const currentImage = await pngDataUrl(path.join(artifactDir, 'current-band-diagram-internal.png'))
  await page.setContent(`
    <style>
      body{margin:0;background:#05080d;color:#d8e4f0;font:14px Inter,Arial,sans-serif}
      .wrap{display:grid;grid-template-columns:1fr 1fr;gap:0}
      figure{margin:0;border-right:1px solid #22303c}
      figcaption{position:fixed;top:8px;margin-left:8px;background:#08131c;padding:6px 10px;border:1px solid #22303c;border-radius:6px}
      img{width:100%;display:block}
    </style>
    <div class="wrap">
      <figure><figcaption>Manus band internals</figcaption><img src="${manuscriptImage}" /></figure>
      <figure><figcaption>Current band internals</figcaption><img src="${currentImage}" /></figure>
    </div>
  `)
  await waitForImages(page)
  await page.screenshot({ path: path.join(artifactDir, 'compare-band-diagram-internal.png'), fullPage: true })
  await page.close()
}

async function captureBandInternal(page, baseUrl, prefix) {
  await page.goto(`${baseUrl}/band-diagram`, { waitUntil: 'networkidle', timeout: 45000 }).catch(async () => {
    await page.goto(`${baseUrl}/band-diagram`, { waitUntil: 'domcontentloaded', timeout: 45000 })
  })
  await page.waitForTimeout(900)
  await page.screenshot({ path: path.join(artifactDir, `${prefix}-band-diagram-internal.png`), fullPage: true })
  return page.evaluate(() => {
    const round = (value) => Math.round(value * 100) / 100
    const rect = (element) => {
      if (!element) return null
      const box = element.getBoundingClientRect()
      return { x: round(box.x), y: round(box.y), width: round(box.width), height: round(box.height), top: round(box.top), bottom: round(box.bottom) }
    }
    const style = (element, props) => {
      if (!element) return {}
      const computed = getComputedStyle(element)
      return Object.fromEntries(props.map((prop) => [prop, computed.getPropertyValue(prop)]))
    }
    const firstVisible = (selector) => Array.from(document.querySelectorAll(selector)).find((element) => {
      const box = element.getBoundingClientRect()
      return box.width > 1 && box.height > 1
    }) ?? null
    const findText = (text) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        if (node.nodeValue?.includes(text)) return node.parentElement
        node = walker.nextNode()
      }
      return null
    }
    const cardFromText = (text) => {
      const anchor = findText(text)
      let element = anchor
      while (element && element !== document.body) {
        const box = element.getBoundingClientRect()
        if (box.width >= 300 && box.height >= 250 && box.width < window.innerWidth - 260) return element
        element = element.parentElement
      }
      return null
    }
    const largestVisible = (elements) => elements
      .filter((element) => {
        const box = element.getBoundingClientRect()
        return box.width > 20 && box.height > 20
      })
      .sort((a, b) => {
        const aBox = a.getBoundingClientRect()
        const bBox = b.getBoundingClientRect()
        return (bBox.width * bBox.height) - (aBox.width * aBox.height)
      })[0] ?? null
    const centerCard = cardFromText('Energy Band Diagram') ?? document.querySelector('.manus-chart-card')
    const title = findText('Energy Band Diagram')
    const badge = firstVisible('.manus-status-badge, [class*="badge"]')
    const svg = largestVisible(Array.from(centerCard?.querySelectorAll('svg') ?? document.querySelectorAll('.band-diagram-preview svg, svg')))
    const plot = svg?.querySelector('.band-plot-bg, .recharts-cartesian-grid-bg') ?? svg
    const grid = Array.from(svg?.querySelectorAll('.band-grid-line, .recharts-cartesian-grid line, line') ?? [])
      .find((element) => {
        const box = element.getBoundingClientRect()
        return box.width > 40 || box.height > 40
      }) ?? null
    const curve = Array.from(svg?.querySelectorAll('.band-curve, .recharts-line-curve, path') ?? [])
      .find((element) => {
        const stroke = getComputedStyle(element).stroke
        const box = element.getBoundingClientRect()
        return stroke && stroke !== 'none' && box.width > 40 && box.height > 4
      }) ?? null
    const xTick = Array.from(svg?.querySelectorAll('.band-tick-label, .recharts-cartesian-axis-tick text, text') ?? [])
      .find((element) => {
        const text = element.textContent ?? ''
        const box = element.getBoundingClientRect()
        return box.width > 0 && /-?\d/.test(text)
      }) ?? null
    const rightRow = firstVisible('.band-analysis-cards .meta-box, .meta-box')
    const leftRow = firstVisible('.manus-three-left .manus-list-row, .manus-list-row, button')
    const modeButton = firstVisible('.segmented-vertical button')

    return {
      centerCard: rect(centerCard),
      plotArea: rect(plot),
      title: { rect: rect(title), style: style(title, ['font-size', 'line-height', 'font-weight']) },
      badge: { rect: rect(badge), style: style(badge, ['font-size', 'height', 'padding-left', 'padding-right']) },
      xAxisTick: { rect: rect(xTick), style: style(xTick, ['font-size', 'fill', 'color']) },
      yAxisTick: { rect: rect(xTick), style: style(xTick, ['font-size', 'fill', 'color']) },
      gridLine: { rect: rect(grid), style: style(grid, ['stroke', 'stroke-opacity', 'stroke-width']) },
      curve: { rect: rect(curve), style: style(curve, ['stroke', 'stroke-width']) },
      chartMargins: {
        left: plot && centerCard ? round(plot.getBoundingClientRect().left - centerCard.getBoundingClientRect().left) : null,
        top: plot && centerCard ? round(plot.getBoundingClientRect().top - centerCard.getBoundingClientRect().top) : null,
      },
      rightParameterRow: rect(rightRow),
      leftSelectorRow: rect(leftRow),
      modeButton: rect(modeButton),
    }
  })
}

function diffMetrics(reference, current) {
  const output = {}
  for (const slug of Object.keys(reference)) {
    output[slug] = {}
    collectDiffs(reference[slug], current[slug], output[slug])
  }
  return output
}

function collectDiffs(reference, current, output, prefix = '') {
  for (const key of Object.keys(reference ?? {})) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key
    const refValue = reference?.[key]
    const currentValue = current?.[key]
    if (typeof refValue === 'number' && typeof currentValue === 'number') {
      output[nextPrefix] = round(currentValue - refValue)
    } else if (refValue && currentValue && typeof refValue === 'object' && typeof currentValue === 'object') {
      collectDiffs(refValue, currentValue, output, nextPrefix)
    }
  }
}

async function writeJson(name, data) {
  await writeFile(path.join(artifactDir, name), `${JSON.stringify(data, null, 2)}\n`)
}

function roundRect(rectangle) {
  return Object.fromEntries(Object.entries(rectangle).map(([key, value]) => [key, round(value)]))
}

function round(value) {
  return Math.round(value * 100) / 100
}

async function pngDataUrl(filePath) {
  const buffer = await readFile(filePath)
  return `data:image/png;base64,${buffer.toString('base64')}`
}

async function waitForImages(page) {
  await page.waitForFunction(() =>
    Array.from(document.images).every((image) => image.complete && image.naturalWidth > 0),
  )
}
