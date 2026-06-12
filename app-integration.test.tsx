// @vitest-environment jsdom
// 整合驗證：每個分頁渲染無錯誤、版面預設收合、hash 導覽
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { AppShell } from './src/components/layout/AppShell'
import { workspaceTabs } from './src/data/workspaceTabs'

HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never

function freshRender() {
  cleanup()
  window.localStorage.clear()
  window.location.hash = ''
  return render(<AppShell />)
}

describe('all tabs render without hitting the error boundary', () => {
  for (const tab of workspaceTabs) {
    it(`tab ${tab.id} (${tab.label}) renders cleanly`, () => {
      freshRender()
      const target = screen
        .getAllByRole('button')
        .find((b) => b.textContent === tab.label)
      expect(target, `找不到分頁按鈕 ${tab.label}`).toBeTruthy()
      fireEvent.click(target!)
      // ErrorBoundary fallback 不應出現
      expect(screen.queryByText('這個分頁發生錯誤')).toBeNull()
    })
  }
})

describe('layout defaults', () => {
  it('sidebars collapsed by default (展開 buttons visible)', () => {
    freshRender()
    expect(screen.getByLabelText('展開元件控制側欄')).toBeTruthy()
    expect(screen.getByLabelText('展開分析結果側欄')).toBeTruthy()
  })
  it('bottom panel collapsed by default and toggles', () => {
    freshRender()
    const toggle = screen.getByText('底部圖表與分析面板（占位）').closest('button')!
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
    expect(window.localStorage.getItem('bottomPanelOpen')).toBe('true')
  })
  it('sidebar expand persists preference', () => {
    freshRender()
    fireEvent.click(screen.getByLabelText('展開元件控制側欄'))
    expect(window.localStorage.getItem('leftSidebarCollapsed')).toBe('false')
    expect(screen.getByLabelText('收合元件控制側欄')).toBeTruthy()
  })
})

describe('hash navigation', () => {
  it('initial hash selects tab', () => {
    cleanup()
    window.localStorage.clear()
    window.location.hash = '#oxidation'
    render(<AppShell />)
    expect(screen.getByText('氧化模擬與 Raman 解釋')).toBeTruthy()
  })
  it('hashchange event switches tab', async () => {
    freshRender()
    await act(async () => {
      window.location.hash = '#literature'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(
      screen.getAllByText(/文獻資料庫/).length,
    ).toBeGreaterThan(0)
  })
})

describe('oxidation workspace functional check', () => {
  it('growth law selector exists and switches parameter fields', () => {
    freshRender()
    const target = screen
      .getAllByRole('button')
      .find((b) => b.textContent === '氧化模擬')!
    fireEvent.click(target)
    const select = screen.getByLabelText(/氧化成長律/) as HTMLSelectElement
    expect(select).toBeTruthy()
    fireEvent.change(select, { target: { value: 'deal_grove' } })
    expect(screen.getByLabelText(/Deal-Grove A/)).toBeTruthy()
    fireEvent.change(select, { target: { value: 'cabrera_mott' } })
    expect(screen.getByLabelText(/Cabrera-Mott a（截距）/)).toBeTruthy()
  })
})

describe('electrical advanced physics section', () => {
  it('advanced section expands with new physics fields', () => {
    freshRender()
    const target = screen
      .getAllByRole('button')
      .find((b) => b.textContent === '電性分析')!
    fireEvent.click(target)
    const advanced = screen.getByText('進階物理機制').closest('button')!
    fireEvent.click(advanced)
    expect(screen.getByLabelText(/通道輸出模型/)).toBeTruthy()
    expect(screen.getByLabelText(/Schottky 障礙高度/)).toBeTruthy()
    expect(screen.getByLabelText(/載子有效質量/)).toBeTruthy()
  })
})
