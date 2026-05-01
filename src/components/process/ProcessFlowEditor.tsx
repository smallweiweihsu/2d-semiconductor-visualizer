import { useMemo, useState } from 'react'
import { defaultProcessFlow } from '../../data/defaultProcessFlow'
import { cloneProcessStep } from '../../data/processSteps'
import type { DeviceLayer } from '../../types/device'
import type { ProcessFlow, ProcessStep } from '../../types/process'
import { ProcessStepEditor } from './ProcessStepEditor'
import { ProcessStepTemplatePicker } from './ProcessStepTemplatePicker'
import { ProcessSummary } from './ProcessSummary'
import { ProcessTimeline } from './ProcessTimeline'
import { ProcessValidationPanel } from './ProcessValidationPanel'
import { validateProcessFlow } from './processValidation'

interface ProcessFlowEditorProps {
  deviceLayers: DeviceLayer[]
  flow?: ProcessFlow
  onChangeFlow?: (updater: (flow: ProcessFlow) => ProcessFlow) => void
}

export function ProcessFlowEditor({
  deviceLayers,
  flow: controlledFlow,
  onChangeFlow,
}: ProcessFlowEditorProps) {
  const [internalFlow, setInternalFlow] = useState<ProcessFlow>(() =>
    structuredClone(defaultProcessFlow),
  )
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    (controlledFlow ?? internalFlow).steps[0]?.id ?? null,
  )
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)

  const flow = controlledFlow ?? internalFlow
  const warnings = useMemo(() => validateProcessFlow(flow), [flow])
  const selectedStep =
    flow.steps.find((step) => step.id === selectedStepId) ?? null

  function updateFlow(updates: Partial<ProcessFlow>) {
    updateCurrentFlow((current) => ({
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    }))
  }

  function updateSteps(updater: (steps: ProcessStep[]) => ProcessStep[]) {
    updateCurrentFlow((current) => ({
      ...current,
      steps: updater(current.steps),
      updatedAt: new Date().toISOString(),
    }))
  }

  function updateCurrentFlow(updater: (flow: ProcessFlow) => ProcessFlow) {
    if (onChangeFlow) {
      onChangeFlow(updater)
      return
    }

    setInternalFlow(updater)
  }

  function updateStep(updatedStep: ProcessStep) {
    updateSteps((steps) =>
      steps.map((step) => (step.id === updatedStep.id ? updatedStep : step)),
    )
  }

  function addStep(template: ProcessStep) {
    const nextStep = cloneProcessStep(template)

    updateSteps((steps) => [...steps, nextStep])
    setSelectedStepId(nextStep.id)
    setShowTemplatePicker(false)
  }

  function deleteStep(stepId: string) {
    updateSteps((steps) => {
      const stepIndex = steps.findIndex((step) => step.id === stepId)
      const nextSteps = steps.filter((step) => step.id !== stepId)
      const nextSelectedStep =
        nextSteps[Math.min(stepIndex, nextSteps.length - 1)] ?? null

      setSelectedStepId(nextSelectedStep?.id ?? null)
      return nextSteps
    })
  }

  function duplicateStep(stepId: string) {
    const stepIndex = flow.steps.findIndex((step) => step.id === stepId)
    const step = flow.steps[stepIndex]

    if (!step) {
      return
    }

    const duplicatedStep = {
      ...cloneProcessStep(step),
      name_zh: `${step.name_zh} 副本`,
    }

    updateSteps((steps) => [
      ...steps.slice(0, stepIndex + 1),
      duplicatedStep,
      ...steps.slice(stepIndex + 1),
    ])
    setSelectedStepId(duplicatedStep.id)
  }

  function moveStep(stepId: string, direction: 'up' | 'down') {
    updateSteps((steps) => {
      const stepIndex = steps.findIndex((step) => step.id === stepId)
      const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1

      if (stepIndex < 0 || targetIndex < 0 || targetIndex >= steps.length) {
        return steps
      }

      const nextSteps = [...steps]
      const movedStep = nextSteps[stepIndex]
      nextSteps[stepIndex] = nextSteps[targetIndex]
      nextSteps[targetIndex] = movedStep
      return nextSteps
    })
  }

  function toggleStep(stepId: string) {
    updateSteps((steps) =>
      steps.map((step) =>
        step.id === stepId ? { ...step, enabled: !step.enabled } : step,
      ),
    )
  }

  return (
    <section className="flex min-h-[calc(100vh-13rem)] min-w-0 flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900/70 p-4 shadow-2xl shadow-slate-950/30">
      <header className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-50">
            製程流程與退火擴散
          </h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-400">
            建立金屬沉積、介電層沉積、氧化、RIE、退火與量測流程；目前僅記錄與組織製程條件，尚未進行真實擴散或製程模擬。
          </p>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500">
          已讀取 {deviceLayers.length} 個元件材料層作為關聯候選
        </div>
      </header>

      <aside className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-4 text-sm leading-6 text-amber-100/90">
        目前製程流程僅用於記錄與組織實驗步驟，尚未進行真實製程、擴散、氧化、蝕刻或量測模擬。
      </aside>

      {showTemplatePicker ? (
        <ProcessStepTemplatePicker
          onAddTemplate={addStep}
          onClose={() => setShowTemplatePicker(false)}
        />
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <ProcessTimeline
          steps={flow.steps}
          selectedStepId={selectedStepId}
          warnings={warnings}
          onAddStep={() => setShowTemplatePicker(true)}
          onDeleteStep={deleteStep}
          onDuplicateStep={duplicateStep}
          onMoveStep={moveStep}
          onSelectStep={setSelectedStepId}
          onToggleStep={toggleStep}
        />

        <div className="grid min-h-0 gap-4 xl:grid-rows-[minmax(0,1fr)_auto]">
          <ProcessStepEditor
            deviceLayers={deviceLayers}
            step={selectedStep}
            onUpdateStep={updateStep}
          />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <ProcessSummary
              flow={flow}
              warnings={warnings}
              onUpdateFlow={updateFlow}
            />
            <ProcessValidationPanel warnings={warnings} />
          </div>
        </div>
      </div>
    </section>
  )
}
