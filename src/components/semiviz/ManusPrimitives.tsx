import type { ReactNode } from 'react'

export function ManusSplitDetail({
  className = '',
  list,
  detail,
}: {
  className?: string
  list: ReactNode
  detail: ReactNode
}) {
  return (
    <div className={`manus-split-detail ${className}`}>
      <aside className="manus-split-list">{list}</aside>
      <section className="manus-split-main">{detail}</section>
    </div>
  )
}

export function ManusListRow({
  active = false,
  color,
  title,
  subtitle,
  meta,
  badge,
  icon,
  onClick,
}: {
  active?: boolean
  color?: string
  title: ReactNode
  subtitle?: ReactNode
  meta?: ReactNode
  badge?: ReactNode
  icon?: ReactNode
  onClick?: () => void
}) {
  const content = (
    <>
      {icon ?? (color ? <span className="manus-row-dot" style={{ backgroundColor: color }} /> : null)}
      <span className="manus-row-copy">
        <strong>{title}</strong>
        {subtitle ? <small>{subtitle}</small> : null}
        {meta ? <em>{meta}</em> : null}
      </span>
      {badge ? <span className="manus-row-badge">{badge}</span> : null}
    </>
  )

  if (onClick) {
    return (
      <button className={active ? 'manus-list-row active' : 'manus-list-row'} type="button" onClick={onClick}>
        {content}
      </button>
    )
  }

  return <div className={active ? 'manus-list-row active' : 'manus-list-row'}>{content}</div>
}

export function ManusDetailHeader({
  icon,
  title,
  subtitle,
  badge,
}: {
  icon?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  badge?: ReactNode
}) {
  return (
    <header className="manus-detail-header">
      {icon ? <span className="manus-detail-icon">{icon}</span> : null}
      <div>
        <h2>{title}</h2>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {badge ? <div className="manus-detail-badge">{badge}</div> : null}
    </header>
  )
}

export function ManusStatusBadge({ tone = 'neutral', children }: { tone?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'; children: ReactNode }) {
  return <span className={`manus-status-badge tone-${tone}`}>{children}</span>
}

export function ManusScoreDots({ score, max = 10 }: { score: number; max?: number }) {
  return (
    <span className="manus-score-dots" aria-label={`score ${score} of ${max}`}>
      {Array.from({ length: max }).map((_, index) => (
        <i className={index < score ? 'filled' : ''} key={index} />
      ))}
    </span>
  )
}

export function ManusMetadataGrid({ items }: { items: Array<{ label: ReactNode; value: ReactNode }> }) {
  return (
    <div className="manus-metadata-grid">
      {items.map((item, index) => (
        <div key={index}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  )
}

export function ManusCallout({ tone = 'neutral', children }: { tone?: 'primary' | 'warning' | 'neutral'; children: ReactNode }) {
  return <div className={`manus-callout tone-${tone}`}>{children}</div>
}

export function ManusPreviewCard({ children }: { children: ReactNode }) {
  return <div className="manus-preview-card">{children}</div>
}

export function ManusChipSelector<T extends string>({
  items,
  selected,
  onToggle,
}: {
  items: Array<{ id: T; label: ReactNode; color?: string; meta?: ReactNode }>
  selected: T[]
  onToggle: (id: T) => void
}) {
  return (
    <div className="manus-chip-selector">
      {items.map((item) => (
        <button className={selected.includes(item.id) ? 'active' : ''} type="button" key={item.id} onClick={() => onToggle(item.id)}>
          {item.color ? <span style={{ backgroundColor: item.color }} /> : null}
          <strong>{item.label}</strong>
          {item.meta ? <small>{item.meta}</small> : null}
        </button>
      ))}
    </div>
  )
}
