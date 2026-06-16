import {
  Activity,
  Atom,
  BarChart3,
  BookOpen,
  Database,
  FlaskConical,
  GitBranch,
  GitCompare,
  LayoutDashboard,
  Layers,
  Lightbulb,
  Search,
} from 'lucide-react'
import { Link, Route, Switch, useLocation } from 'wouter'
import { useUiMode } from '../../store/uiMode'
import { ProjectActions } from './ProjectActions'
import { FloatingAI } from './FloatingAI'
import {
  BandDiagramPage,
  ComparisonLabPage,
  DashboardPage,
  DeviceBuilderPage,
  IVSimulatorPage,
  MaterialsPage,
  MeasurementsPage,
  ProcessFlowPage,
  ReferencesPage,
  ResearchNotesPage,
} from '../../features/semiviz/pages'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Device Builder', icon: Layers, path: '/device-builder' },
  { label: 'Process Flow', icon: GitBranch, path: '/process-flow' },
  { label: 'I–V Simulator', icon: Activity, path: '/iv-simulator' },
  { label: 'Band Diagram', icon: BarChart3, path: '/band-diagram' },
  { label: 'Materials', icon: Database, path: '/materials' },
  { label: 'References', icon: BookOpen, path: '/references' },
  { label: 'Measurements', icon: FlaskConical, path: '/measurements' },
  { label: 'Comparison Lab', icon: GitCompare, path: '/comparison-lab' },
  { label: 'Research Notes', icon: Lightbulb, path: '/research-notes' },
]

function ModeToggle() {
  const { simple, toggle } = useUiMode()
  return (
    <button className="mode-toggle" type="button" onClick={toggle} title="切換簡易／進階顯示">
      {simple ? '簡易' : '進階'}
    </button>
  )
}

export function ManusShell() {
  const [location] = useLocation()

  return (
    <div className="manus-app">
      <aside className="manus-sidebar">
        <div className="manus-brand">
          <span className="manus-logo"><Atom size={18} /></span>
          <strong>2D Semi Visualizer</strong>
        </div>
        <nav className="manus-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = item.path === '/' ? location === '/' : location === item.path
            return (
              <Link className={active ? 'active' : ''} href={item.path} key={item.path}>
                <Icon size={17} />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="manus-collapse">‹</div>
      </aside>

      <div className="manus-workspace">
        <header className="manus-topbar">
          <label className="manus-search">
            <Search size={16} />
            <input placeholder="搜尋材料、元件、文獻..." />
          </label>
          <ModeToggle />
          <ProjectActions />
        </header>
        <main className="manus-main" data-testid="route-scroll-container">
          <Switch>
            <Route path="/" component={DashboardPage} />
            <Route path="/device-builder" component={DeviceBuilderPage} />
            <Route path="/process-flow" component={ProcessFlowPage} />
            <Route path="/iv-simulator" component={IVSimulatorPage} />
            <Route path="/band-diagram" component={BandDiagramPage} />
            <Route path="/materials" component={MaterialsPage} />
            <Route path="/references" component={ReferencesPage} />
            <Route path="/measurements" component={MeasurementsPage} />
            <Route path="/comparison-lab" component={ComparisonLabPage} />
            <Route path="/research-notes" component={ResearchNotesPage} />
          </Switch>
        </main>
      </div>
      <FloatingAI />
    </div>
  )
}
