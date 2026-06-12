import { spawn } from 'node:child_process'
import { mkdtemp, writeFile } from 'node:fs/promises'
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
  ['Dashboard', '/'],
  ['Device Builder', '/device-builder'],
  ['Process Flow', '/process-flow'],
  ['I–V Simulator', '/iv-simulator'],
  ['Band Diagram', '/band-diagram'],
  ['Materials', '/materials'],
  ['References', '/references'],
  ['Measurements', '/measurements'],
  ['Comparison Lab', '/comparison-lab'],
  ['Research Notes', '/research-notes'],
]

let server
let previewServer

try {
  server = await startServer('dev', port)
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const warnings = []

  page.on('console', (message) => {
    if (message.type() === 'error') {
      warnings.push(message.text())
    }
  })

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await expectVisible(page.getByRole('heading', { name: '2D Semiconductor Device Visualizer' }), 'dashboard renders')

  for (const [label, route] of routes) {
    await page.getByRole('link', { name: label, exact: true }).click()
    await page.waitForURL(`${baseUrl}${route}`)
    await assertCanScroll(page, `route ${route} can scroll`)
  }

  await page.goto(`${baseUrl}/research-notes`, { waitUntil: 'networkidle' })
  await assertCanScroll(page, 'research-notes can scroll')

  await page.goto(`${baseUrl}/device-builder`, { waitUntil: 'networkidle' })
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
  await page.reload({ waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'EXPLODED' }).click()
  await expectVisible(page.locator('.view-tabs button.active', { hasText: 'EXPLODED' }), 'device-builder can switch view mode')
  const viewportContainsStack = await page.evaluate(() => {
    const stage = document.querySelector('.large-device-stage')?.getBoundingClientRect()
    const stack = document.querySelector('.layer-stack-graphic')?.getBoundingClientRect()
    if (!stage || !stack) return false
    return stack.left >= stage.left && stack.right <= stage.right && stack.top >= stage.top && stack.bottom <= stage.bottom
  })
  if (!viewportContainsStack) {
    throw new Error('device-builder stack viewport overflows stage')
  }
  await page.getByRole('button', { name: 'WSe₂ 通道 semiconductor · 1 nm channel' }).click()
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
  await page.reload({ waitUntil: 'networkidle' })
  const zStillReasonable = await page.evaluate(() => window.localStorage.getItem('semiviz-project-v2')?.includes('"z_nm":20'))
  if (!zStillReasonable) {
    throw new Error('normalized z positions did not persist after refresh')
  }
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
  await page.goto(`${baseUrl}/device-builder`, { waitUntil: 'networkidle' })

  await page.getByRole('button', { name: '新增 layer' }).click()
  await page.getByLabel('layer name').fill('Smoke Gate Oxide')
  await page.getByLabel('materialId').selectOption('hfo2')
  await page.getByLabel('thickness_nm').fill('18')
  await page.getByLabel('electricalRole').selectOption('gate_dielectric')
  await page.getByLabel('Gate dielectric').selectOption({ label: 'Smoke Gate Oxide' })
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('Smoke Gate Oxide'))
  await page.reload({ waitUntil: 'networkidle' })
  await expectVisible(page.locator('.pane-list').getByText('Smoke Gate Oxide'), 'edited layer persists after refresh')
  await page.goto(`${baseUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await expectVisible(page.getByText('HfO₂'), 'I-V simulator reads configured gate dielectric layer')

  await page.goto(`${baseUrl}/references`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '新增 reference' }).click()
  await page.getByLabel('Title').fill('Smoke Mobility Source')
  await page.getByLabel('Authors').fill('Manual QA')
  await page.getByLabel('DOI').fill('manual-smoke-doi')
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('Smoke Mobility Source'))

  await page.goto(`${baseUrl}/materials`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'WSe₂二維過渡金屬硫族化物，常用於場效電晶體' }).click()
  await page.getByLabel('mobility_cm2Vs confidence').selectOption('estimated')
  await page.getByRole('spinbutton', { name: 'Value', exact: true }).fill('88')
  await page.getByLabel('mobility_cm2Vs source reference').selectOption({ label: 'Smoke Mobility Source' })
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('manual-smoke-doi'))
  await page.reload({ waitUntil: 'networkidle' })
  await expectVisible(page.locator('.linked-source-list', { hasText: 'Smoke Mobility Source · manual-smoke-doi' }), 'material mobility source persists after refresh')

  await page.goto(`${baseUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await expectVisible(page.getByText('Smoke Mobility Source · manual-smoke-doi'), 'I-V simulator shows mobility source')
  await expectVisible(page.locator('.parameter-table', { hasText: 'estimated' }), 'I-V simulator shows mobility confidence')

  await page.goto(`${baseUrl}/materials`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'WSe₂二維過渡金屬硫族化物，常用於場效電晶體' }).click()
  await page.getByLabel('mobility_cm2Vs confidence').selectOption('unknown')
  await page.waitForFunction(() => window.localStorage.getItem('semiviz-project-v2')?.includes('"confidence":"unknown"'))
  await page.goto(`${baseUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await expectVisible(page.locator('.disabled-chart').first(), 'unknown mobility disables chart')
  await page.getByText('Use fallback values for prototype preview', { exact: true }).click()
  await expectVisible(page.locator('svg.recharts-surface').first(), 'fallback preview restores chart')

  await page.goto(`${baseUrl}/device-builder`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '新增元件' }).click()
  await page.getByLabel('元件名稱').fill('Smoke Test Device')
  await page.getByLabel('描述').fill('localStorage persistence check')
  await page.getByRole('button', { name: '建立並保存' }).click()
  await page.reload({ waitUntil: 'networkidle' })
  await expectVisible(page.locator('.template-panel strong', { hasText: 'Smoke Test Device' }), 'new device persists after reload')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '匯出 JSON' }).click()
  const download = await downloadPromise
  if (!download.suggestedFilename().endsWith('.json')) {
    throw new Error('export JSON did not produce a JSON download')
  }

  const tempDir = await mkdtemp(path.join(tmpdir(), 'semiviz-smoke-'))

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
  await page.goto(`${baseUrl}/device-builder`, { waitUntil: 'networkidle' })
  await expectVisible(page.locator('.empty-state', { hasText: '尚無 layer，請新增第一個 layer。' }).first(), 'empty-layer device shows empty state')

  previewServer = await startServer('preview', previewPort)
  const previewPage = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await previewPage.goto(`${previewUrl}/iv-simulator`, { waitUntil: 'networkidle' })
  await expectVisible(previewPage.getByRole('heading', { name: 'I–V Simulator' }), 'preview direct /iv-simulator route renders')
  await previewPage.goto(`${previewUrl}/device-builder`, { waitUntil: 'networkidle' })
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
