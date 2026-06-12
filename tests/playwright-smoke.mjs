import { spawn } from 'node:child_process'
import { mkdir, mkdtemp, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'

const port = 5174
const baseUrl = `http://127.0.0.1:${port}`
const previewPort = 4174
const previewUrl = `http://127.0.0.1:${previewPort}`
const storageKey = 'semiviz-project-v2'
const legacyStorageKey = 'semiviz-project-v1'
const routes = [
  ['Dashboard', '/', 'dashboard'],
  ['Device Builder', '/device-builder', 'device-builder'],
  ['Process Flow', '/process-flow', 'process-flow'],
  ['I–V Simulator', '/iv-simulator', 'iv-simulator'],
  ['Band Diagram', '/band-diagram', 'band-diagram'],
  ['Materials', '/materials', 'materials'],
  ['References', '/references', 'references'],
  ['Measurements', '/measurements', 'measurements'],
  ['Comparison Lab', '/comparison-lab', 'comparison-lab'],
  ['Research Notes', '/research-notes', 'research-notes'],
]

let server
let previewServer

try {
  server = await startServer('dev', port)
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const tempDir = await mkdtemp(path.join(tmpdir(), 'semiviz-smoke-'))
  const artifactDir = path.join(process.cwd(), 'test-artifacts')
  await mkdir(artifactDir, { recursive: true })
  const warnings = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      warnings.push(message.text())
    }
  })

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await expectVisible(page.getByRole('heading', { name: '2D Semiconductor Device Visualizer' }), 'dashboard renders')

  for (const [label, route, slug] of routes) {
    await page.getByRole('link', { name: label, exact: true }).click()
    await page.waitForURL(`${baseUrl}${route}`)
    await assertCanScroll(page, `route ${route} can scroll`)
    await expectVisible(page.locator('.manus-page').first(), `${route} has Manus-style root class`)
    await page.screenshot({ path: path.join(artifactDir, `current-${slug}.png`), fullPage: true })

    if (route === '/references' || route === '/measurements' || route === '/research-notes') {
      await expectVisible(page.locator('.manus-split-detail').first(), `${route} uses split-detail layout`)
    }
    if (route === '/comparison-lab') {
      await expectVisible(page.locator('.manus-chip-selector'), 'comparison lab has material chips')
      await expectVisible(page.locator('[data-testid="comparison-table"]'), 'comparison lab has comparison table')
    }
    if (route === '/materials') {
      await expectVisible(page.locator('.material-detail-panel'), 'materials has material detail panel')
      await expectVisible(page.locator('.material-parameter-card').first(), 'materials has parameter rows')
    }
    if (route === '/band-diagram') {
      await expectVisible(page.locator('.band-diagram-workspace .manus-three-left'), 'band diagram has left material selector')
      await expectVisible(page.locator('[data-testid="band-diagram-preview"]'), 'band diagram has diagram preview')
      await expectVisible(page.locator('[data-testid="band-energy-panel"]'), 'band diagram has right energy parameter panel')
      await expectVisible(page.getByText('Energy Band Diagram', { exact: false }), 'band diagram title includes Energy Band Diagram')
      await page.screenshot({ path: path.join(artifactDir, 'current-band-diagram-refined.png'), fullPage: true })
    }
    if (route === '/iv-simulator') {
      await expectVisible(page.locator('[data-testid="iv-simulation-controls"]'), 'I-V simulator has left controls panel')
      await expectVisible(page.locator('[data-testid="iv-chart-stack"] .manus-chart-card').nth(0), 'I-V simulator has transfer chart card')
      await expectVisible(page.locator('[data-testid="iv-chart-stack"] .manus-chart-card').nth(1), 'I-V simulator has output chart card')
      await expectVisible(page.locator('[data-testid="iv-analysis-panel"]'), 'I-V simulator has right analysis panel')
      const visibleSecondary = await page.locator('.iv-secondary-info').evaluate((element) => element.getBoundingClientRect().height)
      if (visibleSecondary > 80) {
        throw new Error('I-V advanced/extracted information is dominating default layout')
      }
      await page.screenshot({ path: path.join(artifactDir, 'current-iv-simulator-refined.png'), fullPage: true })
    }
    if (route === '/references') {
      await expectVisible(page.locator('.references-workspace .manus-split-list'), 'references has left paper list')
      await expectVisible(page.locator('.references-workspace .manus-list-row.active'), 'references has active selected paper row')
      await expectVisible(page.locator('.reference-detail-panel .manus-detail-header h2'), 'references detail title visible')
      await expectVisible(page.locator('.reference-detail-panel .manus-score-dots'), 'references reliability dots visible')
      await page.screenshot({ path: path.join(artifactDir, 'current-references-refined.png'), fullPage: true })
    }
    if (route === '/research-notes') {
      await expectVisible(page.locator('.research-workspace .manus-split-list'), 'research notes has left hypothesis list')
      await expectVisible(page.locator('.research-workspace .manus-list-row.active'), 'research notes has active selected hypothesis row')
      await expectVisible(page.locator('.hypothesis-detail .detail-section'), 'research notes detail description visible')
      await expectVisible(page.locator('.hypothesis-detail .linked-panels'), 'research notes linked cards visible')
      await page.screenshot({ path: path.join(artifactDir, 'current-research-notes-refined.png'), fullPage: true })
    }
    if (route === '/process-flow') {
      await expectVisible(page.locator('.process-timeline'), 'process flow has timeline list')
      await expectVisible(page.locator('.process-detail'), 'process flow has selected step detail')
    }
  }

  await page.goto(`${baseUrl}/research-notes`, { waitUntil: 'networkidle' })
  await assertCanScroll(page, 'research-notes can scroll')

  const referencePage = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  await assertManusStyleParity(referencePage, page, baseUrl, artifactDir)
  await referencePage.close()

  await page.goto(`${baseUrl}/device-builder`, { waitUntil: 'domcontentloaded' })
  await expectVisible(page.locator('.pane-list > header', { hasText: 'Layer Stack' }), 'device-builder route renders')
  await page.evaluate(({ legacyStorageKey, storageKey }) => {
    const project = JSON.parse(window.localStorage.getItem(storageKey))
    delete project.schemaVersion
    const channel = project.devices[0].layers.find((layer) => layer.id === 'wse2-channel')
    channel.geometry.z_nm = 500010
    const wse2 = project.materials.find((material) => material.id === 'wse2')
    wse2.mobility_cm2Vs = {
      ...wse2.mobility_cm2Vs,
      value: '1-250',
      valueType: 'range',
      range: { min: 1, max: 250 },
      selectedValue: null,
    }
    window.localStorage.removeItem(storageKey)
    window.localStorage.setItem(legacyStorageKey, JSON.stringify(project))
  }, { legacyStorageKey, storageKey })
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: 'EXPLODED' }).click()
  await expectVisible(page.locator('.view-tabs button.active', { hasText: 'EXPLODED' }), 'device-builder can switch view mode')
  await expectVisible(page.locator('[data-testid="device-viewport3d"] canvas'), 'interactive 3D viewport canvas renders')
  const renderLabelStripCount = await page.locator('[data-testid="viewport-label-strip"]').count()
  if (renderLabelStripCount !== 0) {
    throw new Error('Render mode should not show label strip')
  }
  const axesInitiallyActive = await page.getByRole('button', { name: 'Show axes' }).evaluate((button) => button.classList.contains('primary'))
  if (axesInitiallyActive) {
    throw new Error('Show axes should be off by default')
  }
  const viewportScreenshot = path.join(artifactDir, 'device-builder-render-viewport.png')
  await page.locator('.large-device-stage').screenshot({ path: viewportScreenshot })
  const screenshotInfo = await stat(viewportScreenshot)
  if (screenshotInfo.size < 12000) {
    throw new Error('device viewport screenshot is too small or blank')
  }
  await page.locator('.viewport-select', { hasText: 'Display' }).locator('select').selectOption('Inspect')
  await page.getByRole('button', { name: 'WSe₂ 通道 semiconductor · 1 nm channel' }).click()
  await expectVisible(page.locator('.viewport-tooltip', { hasText: 'WSe₂ 通道' }), 'Inspect mode shows selected layer tooltip')
  await page.locator('.viewport-select', { hasText: 'Display' }).locator('select').selectOption('Debug')
  await expectVisible(page.locator('[data-testid="viewport-label-strip"]'), 'Debug mode can show label strip')
  await page.locator('.viewport-select', { hasText: 'Opacity mode' }).locator('select').selectOption('selected-only')
  await page.evaluate(() => {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.viewport-controls button')
    buttons[0]?.click()
    buttons[1]?.click()
    buttons[2]?.click()
    buttons[2]?.click()
  })
  const canvasBox = await page.locator('.large-device-stage').boundingBox()
  if (!canvasBox) {
    throw new Error('3D viewport canvas has no bounding box')
  }
  await page.mouse.move(canvasBox.x + canvasBox.width * 0.35, canvasBox.y + canvasBox.height * 0.45)
  await page.mouse.down()
  await page.mouse.move(canvasBox.x + canvasBox.width * 0.55, canvasBox.y + canvasBox.height * 0.52, { steps: 8 })
  await page.mouse.up()
  await page.getByRole('button', { name: 'TOP' }).click()
  await expectVisible(page.locator('.view-tabs button.active', { hasText: 'TOP' }), 'TOP view mode works with 3D canvas')
  await page.getByRole('button', { name: 'SIDE' }).click()
  await expectVisible(page.locator('.view-tabs button.active', { hasText: 'SIDE' }), 'SIDE view mode works with 3D canvas')
  await page.getByRole('button', { name: 'EXPLODED' }).click()
  await page.getByRole('button', { name: 'WSe₂ 通道 semiconductor · 1 nm channel' }).click()
  await expectVisible(page.locator('.selected-material', { hasText: 'WSe₂ 通道' }), 'layer list selection syncs to properties and 3D highlight state')
  const migratedZValue = await page.getByLabel('relative z offset (nm)').inputValue()
  if (migratedZValue === '500010') {
    throw new Error('legacy absolute z value was not migrated to relative z')
  }
  await page.getByLabel('relative z offset (nm)').fill('500010')
  await expectVisible(page.getByText('z_nm seems absolute; consider using relative stack order instead.'), 'large absolute z warning appears')
  await page.getByRole('button', { name: 'Normalize z positions' }).click()
  await expectVisible(page.getByText('z positions normalized and saved.'), 'z normalization status appears')
  await page.waitForFunction(() => {
    const raw = window.localStorage.getItem('semiviz-project-v2')
    return raw?.includes('"z_nm":20') && raw?.includes('"z_nm":50')
  })
  await page.reload({ waitUntil: 'domcontentloaded' })
  const zStillReasonable = await page.evaluate(() => window.localStorage.getItem('semiviz-project-v2')?.includes('"z_nm":20'))
  if (!zStillReasonable) {
    throw new Error('normalized z positions did not persist after refresh')
  }
  await expectVisible(page.locator('[data-testid="device-viewport3d"] canvas'), '3D viewport renders after refresh')
  await page.goto(`${baseUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await expectVisible(page.getByText('ready with estimates'), 'migrated project uses seed estimates without fallback')
  const migratedIsFallback = await page.locator('.status-fallback_preview').count()
  if (migratedIsFallback) {
    throw new Error('migrated project entered fallback_preview without enabling fallback')
  }
  await expectVisible(page.getByText('Simulation uses estimated seed parameters. Replace with reviewed literature before quantitative use.'), 'estimated seed warning appears')
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: 'Reset local project' }).click()
  await expectVisible(page.getByText('已重設 local project'), 'reset project status appears')
  const resetState = await page.evaluate(({ legacyStorageKey, storageKey }) => ({
    hasLegacy: Boolean(window.localStorage.getItem(legacyStorageKey)),
    current: window.localStorage.getItem(storageKey),
  }), { legacyStorageKey, storageKey })
  if (resetState.hasLegacy || !resetState.current?.includes('semiviz-project-v2')) {
    throw new Error('Reset local project did not clear legacy keys and write v2 seed')
  }
  await page.reload({ waitUntil: 'networkidle' })
  await expectVisible(page.getByText('ready with estimates'), 'reset project persists after refresh')
  await page.goto(`${baseUrl}/device-builder`, { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: '新增 layer' }).click()
  await page.getByLabel('layer name').fill('Smoke Gate Oxide')
  await page.getByLabel('materialId').selectOption('hfo2')
  await page.getByLabel('thickness_nm').fill('18')
  await page.getByLabel('electricalRole').selectOption('gate_dielectric')
  await page.getByLabel('Gate dielectric').selectOption({ label: 'Smoke Gate Oxide' })
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('Smoke Gate Oxide'))
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expectVisible(page.locator('.pane-list').getByText('Smoke Gate Oxide'), 'edited layer persists after refresh')
  await page.goto(`${baseUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await page.getByText('Active device and extracted parameters').click()
  await expectVisible(page.getByText('HfO₂'), 'I-V simulator reads configured gate dielectric layer')

  await page.goto(`${baseUrl}/measurements`, { waitUntil: 'networkidle' })
  const measurementPath = path.join(tempDir, 'transfer.csv')
  await writeFile(measurementPath, 'Vg (V),Vd (V),Id (uA),Ig (nA),sweepDirection\n-1,1,0.01,0,forward\n0,1,0.2,0,forward\n1,1,2.5,0,forward')
  const measurementChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: 'Import electrical CSV' }).click()
  const measurementChooser = await measurementChooserPromise
  await measurementChooser.setFiles(measurementPath)
  await expectVisible(page.getByText('transfer.csv'), 'CSV import preview appears')
  await page.getByRole('button', { name: 'Save measurement' }).click()
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('transfer.csv'))
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('transfer.csv'))
  await expectVisible(page.locator('.measurements-workspace').getByText('transfer').first(), 'imported measurement persists after refresh')
  await expectVisible(page.locator('svg.recharts-surface').first(), 'measurement chart renders')
  await page.goto(`${baseUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await page.getByText('Advanced model controls').click()
  await page.getByLabel('Measurement overlay').selectOption({ label: 'transfer' })
  await page.waitForFunction(() => {
    return Array.from(document.querySelectorAll('select')).some((entry) => entry.selectedOptions[0]?.textContent === 'transfer')
  })
  await expectVisible(page.locator('[data-testid="iv-chart-stack"]'), 'I-V remains functional with measurement overlay available')

  await page.goto(`${baseUrl}/references`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '新增 reference' }).click()
  await page.getByText('Edit reference').click()
  await page.getByLabel('Title').fill('Smoke Mobility Source')
  await page.getByLabel('Authors').fill('Manual QA')
  await page.getByLabel('DOI').fill('manual-smoke-doi')
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('Smoke Mobility Source'))

  await page.goto(`${baseUrl}/materials`, { waitUntil: 'networkidle' })
  await page.locator('.materials-workspace .manus-list-row', { hasText: 'WSe₂' }).first().click()
  await page.getByLabel('mobility_cm2Vs confidence').selectOption('estimated')
  await page.getByRole('spinbutton', { name: 'Value', exact: true }).fill('88')
  await page.getByLabel('mobility_cm2Vs source reference').selectOption({ label: 'Smoke Mobility Source' })
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('manual-smoke-doi'))
  await page.reload({ waitUntil: 'networkidle' })
  await expectVisible(page.locator('.linked-source-list', { hasText: 'Smoke Mobility Source · manual-smoke-doi' }), 'material mobility source persists after refresh')

  await page.goto(`${baseUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await page.getByText('Active device and extracted parameters').click()
  await expectVisible(page.getByText('Smoke Mobility Source · manual-smoke-doi'), 'I-V simulator shows mobility source')
  await expectVisible(page.locator('.iv-simulator-workspace', { hasText: 'estimated' }), 'I-V simulator shows mobility confidence')

  await page.goto(`${baseUrl}/materials`, { waitUntil: 'networkidle' })
  await page.locator('.materials-workspace .manus-list-row', { hasText: 'WSe₂' }).first().click()
  await page.getByLabel('mobility_cm2Vs confidence').selectOption('unknown')
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('"confidence":"unknown"'))
  await page.goto(`${baseUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await expectVisible(page.locator('.disabled-chart').first(), 'unknown mobility disables chart')
  await page.getByText('Advanced model controls').click()
  await page.getByText('Use fallback values for prototype preview', { exact: true }).click()
  await expectVisible(page.locator('svg.recharts-surface').first(), 'fallback preview restores chart')

  await page.goto(`${baseUrl}/device-builder`, { waitUntil: 'domcontentloaded' })
  await page.getByRole('button', { name: '新增元件' }).click()
  await page.getByLabel('元件名稱').fill('Smoke Test Device')
  await page.getByLabel('描述').fill('localStorage persistence check')
  await page.getByRole('button', { name: '建立並保存' }).click()
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expectVisible(page.locator('.template-panel strong', { hasText: 'Smoke Test Device' }), 'new device persists after reload')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '匯出 JSON' }).click()
  const download = await downloadPromise
  if (!download.suggestedFilename().endsWith('.json')) {
    throw new Error('export JSON did not produce a JSON download')
  }

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  const beforeInvalidImport = await page.evaluate(() => window.localStorage.getItem('semiviz-project-v2'))
  const invalidImportPath = path.join(tempDir, 'invalid-project.json')
  await writeFile(invalidImportPath, '{ invalid json')
  const invalidChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: '匯入資料' }).click()
  const invalidChooser = await invalidChooserPromise
  await invalidChooser.setFiles(invalidImportPath)
  await expectVisible(page.getByText(/匯入失敗/), 'invalid JSON import reports failure')
  const afterInvalidImport = await page.evaluate(() => window.localStorage.getItem('semiviz-project-v2'))
  if (beforeInvalidImport !== afterInvalidImport) {
    throw new Error('invalid JSON import overwrote localStorage')
  }

  const importPath = path.join(tempDir, 'project.json')
  await writeFile(importPath, JSON.stringify({
    activeDeviceId: 'imported-device',
    devices: [{
      id: 'imported-device',
      templateId: 'imported',
      name: 'Imported JSON Device',
      description: 'Imported through smoke test',
      tags: ['imported'],
      layers: [],
      createdAt: '2026-06-12',
      updatedAt: '2026-06-12',
    }],
    materials: [],
    processes: [],
    measurements: [],
    references: [],
    hypotheses: [],
  }))

  const fileChooserPromise = page.waitForEvent('filechooser')
  await page.getByRole('button', { name: '匯入資料' }).click()
  const fileChooser = await fileChooserPromise
  await fileChooser.setFiles(importPath)
  await page.waitForTimeout(1000)
  const importedInStorage = await page.evaluate(() => window.localStorage.getItem('semiviz-project-v2')?.includes('Imported JSON Device'))
  if (!importedInStorage) {
    throw new Error('import JSON did not update localStorage')
  }
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await expectVisible(page.getByText('Imported JSON Device'), 'import JSON replaces project data')
  await page.goto(`${baseUrl}/device-builder`, { waitUntil: 'domcontentloaded' })
  await expectVisible(page.locator('.empty-state', { hasText: '尚無 layer，請新增第一個 layer。' }).first(), 'empty-layer device shows empty state')

  previewServer = await startServer('preview', previewPort)
  const previewPage = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await previewPage.goto(`${previewUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await expectVisible(previewPage.locator('.iv-simulator-workspace'), 'preview direct /iv-simulator route renders')
  await previewPage.goto(`${previewUrl}/device-builder`, { waitUntil: 'domcontentloaded' })
  await expectVisible(previewPage.locator('.pane-list > header', { hasText: 'Layer Stack' }), 'preview direct /device-builder route renders')
  await previewPage.goto(`${previewUrl}/research-notes`, { waitUntil: 'networkidle' })
  await previewPage.reload({ waitUntil: 'networkidle' })
  if (previewPage.url() !== `${previewUrl}/research-notes`) {
    throw new Error('preview /research-notes refresh changed route')
  }
  await expectVisible(previewPage.getByRole('heading', { name: '研究假說' }), 'preview /research-notes refresh renders')
  await previewPage.evaluate(() => {
    window.localStorage.setItem('semiviz-project-v2', JSON.stringify({
      schemaVersion: 'semiviz-project-v2',
      activeDeviceId: 'deployment-device',
      devices: [{
        id: 'deployment-device',
        name: 'Deployment Persistence Device',
        description: 'preview persistence check',
        tags: ['deployment'],
        layers: [],
        createdAt: '2026-06-12',
        updatedAt: '2026-06-12',
      }],
      materials: [],
    }))
  })
  await previewPage.reload({ waitUntil: 'networkidle' })
  const previewStoragePersists = await previewPage.evaluate(() => window.localStorage.getItem('semiviz-project-v2')?.includes('Deployment Persistence Device'))
  if (!previewStoragePersists) {
    throw new Error('preview localStorage project did not persist after refresh')
  }

  if (warnings.length) {
    throw new Error(`console errors:\n${warnings.join('\n')}`)
  }

  await browser.close()
  console.log('Playwright smoke test passed')
} finally {
  server?.kill()
  previewServer?.kill()
}

async function startServer(mode, targetPort) {
  if (await isReachable(targetPort)) {
    return undefined
  }

  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `npm run ${mode} -- --host 127.0.0.1 --port ${targetPort}`]
    : ['run', mode, '--', '--host', '127.0.0.1', '--port', String(targetPort)]
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: 'ignore',
    windowsHide: true,
  })

  const started = Date.now()
  while (Date.now() - started < 30000) {
    if (await isReachable(targetPort)) {
      return child
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  child.kill()
  throw new Error('dev server did not start')
}

async function isReachable(targetPort) {
  try {
    const response = await fetch(`http://127.0.0.1:${targetPort}`)
    return response.ok
  } catch {
    return false
  }
}

async function assertCanScroll(page, label) {
  const canScroll = await page.evaluate(() => {
    const element = document.querySelector('[data-testid="route-scroll-container"]')
    if (!element) {
      return false
    }
    const before = element.scrollTop
    element.scrollTop = 320
    const after = element.scrollTop
    element.scrollTop = before
    return after > before
  })

  if (!canScroll) {
    throw new Error(label)
  }
}

async function expectVisible(locator, label) {
  try {
    await locator.waitFor({ state: 'visible', timeout: 5000 })
  } catch {
    throw new Error(label)
  }
}

async function assertManusStyleParity(referencePage, currentPage, baseUrl, artifactDir) {
  const referenceBase = 'https://semiviz2d-cfdeom2b.manus.space'
  const routeConfigs = [
    { route: '/device-builder', left: 'Layer Stack', right: 'Properties', currentLeft: '.pane-list', currentRight: '.inspector-card', currentMajor: '.large-device-stage', referenceMajor: '3D' },
    { route: '/band-diagram', left: '材料選擇', right: '能帶參數', currentLeft: '.manus-three-left', currentRight: '.manus-three-right', currentMajor: '.manus-chart-card', referenceMajor: 'Energy Band Diagram' },
    { route: '/iv-simulator', left: '模擬參數', right: '分析結果', currentLeft: '.manus-three-left', currentRight: '.manus-three-right', currentMajor: '.manus-chart-card', referenceMajor: 'Transfer Curve' },
    { route: '/references', left: '文獻來源', currentLeft: '.manus-split-list', currentMajor: '.reference-detail-panel', referenceMajor: 'Reliability score' },
    { route: '/research-notes', left: '研究假說', currentLeft: '.manus-split-list', currentMajor: '.hypothesis-detail', referenceMajor: '描述' },
  ]

  for (const config of routeConfigs) {
    await referencePage.goto(`${referenceBase}${config.route}`, { waitUntil: 'networkidle', timeout: 45000 }).catch(async () => {
      await referencePage.goto(`${referenceBase}${config.route}`, { waitUntil: 'domcontentloaded', timeout: 45000 })
    })
    await currentPage.goto(`${baseUrl}${config.route}`, { waitUntil: config.route === '/device-builder' ? 'domcontentloaded' : 'networkidle' })
    await referencePage.waitForTimeout(500)
    await currentPage.waitForTimeout(500)

    const referenceMetrics = await measureComparableStyle(referencePage, config)
    const currentMetrics = await measureComparableStyle(currentPage, config)

    assertWithin(currentMetrics.sidebarWidth, referenceMetrics.sidebarWidth, 2, `${config.route} sidebar width`)
    assertWithin(currentMetrics.topbarHeight, referenceMetrics.topbarHeight, 2, `${config.route} topbar height`)
    if (referenceMetrics.leftWidth && currentMetrics.leftWidth) {
      assertWithin(currentMetrics.leftWidth, referenceMetrics.leftWidth, 4, `${config.route} left panel width`)
    }
    if (referenceMetrics.rightWidth && currentMetrics.rightWidth) {
      assertWithin(currentMetrics.rightWidth, referenceMetrics.rightWidth, 4, `${config.route} right panel width`)
    }
    if (referenceMetrics.rowHeight && currentMetrics.rowHeight) {
      assertWithin(currentMetrics.rowHeight, referenceMetrics.rowHeight, 4, `${config.route} row height`)
    }
    if (referenceMetrics.majorWidth && currentMetrics.majorWidth) {
      assertWithin(currentMetrics.majorWidth, referenceMetrics.majorWidth, 8, `${config.route} major card width`)
    }

    const longTicks = await currentPage.locator('.recharts-cartesian-axis-tick text, .band-diagram-preview text').evaluateAll((nodes) =>
      nodes.map((node) => node.textContent ?? '').filter((text) => /\d+\.\d{6,}/.test(text)),
    )
    if (longTicks.length) {
      throw new Error(`${config.route} has long floating tick labels`)
    }
  }

  await currentPage.screenshot({ path: path.join(artifactDir, 'current-style-parity-check.png'), fullPage: false })
}

async function measureComparableStyle(page, config) {
  return page.evaluate((config) => {
    const round = (value) => Math.round(value * 100) / 100
    const rect = (element) => {
      if (!element) return null
      const box = element.getBoundingClientRect()
      return { width: round(box.width), height: round(box.height), x: round(box.x), y: round(box.y) }
    }
    const findText = (text) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
      let node = walker.nextNode()
      while (node) {
        if (node.nodeValue?.includes(text)) return node.parentElement
        node = walker.nextNode()
      }
      return null
    }
    const panelFromText = (text, minHeight = 260, maxWidth = 430) => {
      const anchor = findText(text)
      let element = anchor
      let best = null
      while (element && element !== document.body) {
        const box = element.getBoundingClientRect()
        if (box.height >= minHeight && box.width >= 160 && box.width <= maxWidth) best = element
        element = element.parentElement
      }
      return best
    }
    const cardFromText = (text) => {
      const anchor = findText(text)
      let element = anchor
      while (element && element !== document.body) {
        const box = element.getBoundingClientRect()
        if (box.width >= 280 && box.height >= 240 && box.width < window.innerWidth - 260) return element
        element = element.parentElement
      }
      return null
    }
    const firstVisible = (selector) => Array.from(document.querySelectorAll(selector)).find((element) => {
      const box = element.getBoundingClientRect()
      return box.width > 1 && box.height > 1
    })

    const left = document.querySelector(config.currentLeft) ?? panelFromText(config.left)
    const right = config.currentRight ? (document.querySelector(config.currentRight) ?? panelFromText(config.right)) : null
    const row = firstVisible('.manus-list-row, .layer-editor-row, button')
    const major = document.querySelector(config.currentMajor) ?? cardFromText(config.referenceMajor)

    return {
      sidebarWidth: rect(document.querySelector('.manus-sidebar') ?? document.querySelector('aside'))?.width,
      topbarHeight: rect(document.querySelector('.manus-topbar') ?? document.querySelector('header'))?.height,
      leftWidth: rect(left)?.width,
      rightWidth: rect(right)?.width,
      rowHeight: rect(row)?.height,
      majorWidth: rect(major)?.width,
      majorHeight: rect(major)?.height,
    }
  }, config)
}

function assertWithin(actual, expected, tolerance, label) {
  if (actual === undefined || expected === undefined) {
    return
  }
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${label}: expected ${actual}px to be within ±${tolerance}px of Manus ${expected}px`)
  }
}
