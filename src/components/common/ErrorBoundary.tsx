import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  /**
   * 重設 key：值改變時（例如切換分頁）會自動清除錯誤狀態，
   * 讓使用者切到其他分頁時不會被卡在錯誤畫面。
   */
  resetKey?: string
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * 工作區錯誤邊界。
 * 單一分頁發生 runtime 錯誤時，只會顯示錯誤卡片，
 * 不會讓整個應用程式變成空白頁或導致無法切換分頁。
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Workspace error boundary caught:', error, info)
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  handleReset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return (
        <section className="flex min-h-[24rem] min-w-0 flex-col items-center justify-center gap-4 rounded-lg border border-rose-900/60 bg-rose-950/20 p-6 text-center">
          <h2 className="text-lg font-semibold text-rose-100">
            這個分頁發生錯誤
          </h2>
          <p className="max-w-xl text-sm leading-6 text-rose-200/80">
            此分頁的內容在執行時發生問題，其他分頁仍可正常使用。你可以按下方按鈕重試，或切換到其他分頁。
          </p>
          <pre className="max-w-full overflow-x-auto rounded-md border border-rose-900/40 bg-slate-950/60 px-3 py-2 text-left text-xs text-rose-300/80">
            {this.state.error.message}
          </pre>
          <button
            className="rounded-md border border-rose-700 bg-rose-950/40 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-500"
            onClick={this.handleReset}
            type="button"
          >
            重試
          </button>
        </section>
      )
    }

    return this.props.children
  }
}
