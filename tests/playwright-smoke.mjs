import { spawn } from 'node:child_process'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { chromium } from 'playwright'

const port = 5174
const baseUrl = `http://127.0.0.1:${port}`
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

try {
  server = await startServer()
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
  await page.getByRole('button', { name: 'EXPLODED' }).click()
  await expectVisible(page.locator('.view-tabs button.active', { hasText: 'EXPLODED' }), 'device-builder can switch view mode')

  await page.getByRole('button', { name: '新增元件' }).click()
  await page.getByLabel('元件名稱').fill('Smoke Test Device')
  await page.getByLabel('描述').fill('localStorage persistence check')
  await page.getByRole('button', { name: '建立並保存' }).click()
  await page.reload({ waitUntil: 'networkidle' })
  await expectVisible(page.getByText('Smoke Test Device'), 'new device persists after reload')

  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: '匯出 JSON' }).click()
  const download = await downloadPromise
  if (!download.suggestedFilename().endsWith('.json')) {
    throw new Error('export JSON did not produce a JSON download')
  }

  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  const tempDir = await mkdtemp(path.join(tmpdir(), 'semiviz-smoke-'))
  const importPath = path.join(tempDir, 'project.json')
  await writeFile(importPath, JSON.stringify({
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
  const importedInStorage = await page.evaluate(() => window.localStorage.getItem('semiviz-project-v1')?.includes('Imported JSON Device'))
  if (!importedInStorage) {
    throw new Error('import JSON did not update localStorage')
  }
  await page.goto(baseUrl, { waitUntil: 'networkidle' })
  await expectVisible(page.getByText('Imported JSON Device'), 'import JSON replaces project data')

  if (warnings.length) {
    throw new Error(`console errors:\n${warnings.join('\n')}`)
  }

  await browser.close()
  console.log('Playwright smoke test passed')
} finally {
  server?.kill()
}

async function startServer() {
  if (await isReachable()) {
    return undefined
  }

  const command = process.platform === 'win32' ? 'cmd.exe' : 'npm'
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `npm run dev -- --host 127.0.0.1 --port ${port}`]
    : ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)]
  const child = spawn(command, args, {
    cwd: process.cwd(),
    stdio: 'ignore',
    windowsHide: true,
  })

  const started = Date.now()
  while (Date.now() - started < 30000) {
    if (await isReachable()) {
      return child
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  child.kill()
  throw new Error('dev server did not start')
}

async function isReachable() {
  try {
    const response = await fetch(baseUrl)
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
  if (!(await locator.isVisible())) {
    throw new Error(label)
  }
}
