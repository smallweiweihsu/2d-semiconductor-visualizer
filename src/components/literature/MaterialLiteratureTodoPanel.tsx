import { useMemo, useState, type ReactNode } from 'react'
import { materials } from '../../data/materials'
import type {
  MaterialLiteratureTodo,
  ParameterEvidence,
} from '../../types/literature'
import { LiteratureReviewWorkflow } from './LiteratureReviewWorkflow'
import {
  formatParameterKey,
  formatTodoPriority,
  formatTodoStatus,
} from './literatureFormatting'

interface MaterialLiteratureTodoPanelProps {
  todos: MaterialLiteratureTodo[]
  evidence: ParameterEvidence[]
  onChangeTodos: (todos: MaterialLiteratureTodo[]) => void
  onCreateEvidenceFromTodo: (todo: MaterialLiteratureTodo) => void
}

export function MaterialLiteratureTodoPanel({
  todos,
  evidence,
  onChangeTodos,
  onCreateEvidenceFromTodo,
}: MaterialLiteratureTodoPanelProps) {
  const [filters, setFilters] = useState({
    materialId: 'all',
    parameterKey: 'all',
    priority: 'all',
    searchText: '',
    status: 'all',
    candidateState: 'all',
  })
  const filteredTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (filters.materialId !== 'all' && todo.materialId !== filters.materialId) {
          return false
        }
        if (filters.parameterKey !== 'all' && todo.parameterKey !== filters.parameterKey) {
          return false
        }
        if (filters.priority !== 'all' && todo.priority !== filters.priority) {
          return false
        }
        if (filters.status !== 'all' && todo.status !== filters.status) {
          return false
        }
        const hasEvidence = evidence.some(
          (item) =>
            item.materialIds.includes(todo.materialId) &&
            item.parameterKey === todo.parameterKey,
        )
        if (filters.candidateState === 'with_candidate' && !hasEvidence) {
          return false
        }
        if (filters.candidateState === 'without_candidate' && hasEvidence) {
          return false
        }
        const search = filters.searchText.trim().toLowerCase()
        if (!search) {
          return true
        }
        return [
          getMaterialName(todo.materialId),
          todo.parameterKey,
          todo.reason_zh,
          todo.notes_zh,
          ...todo.suggestedSearchTerms,
        ].some((value) => value?.toLowerCase().includes(search))
      }),
    [evidence, filters, todos],
  )

  function updateTodo(todoId: string, updates: Partial<MaterialLiteratureTodo>) {
    onChangeTodos(
      todos.map((todo) => (todo.id === todoId ? { ...todo, ...updates } : todo)),
    )
  }

  return (
    <section className="grid gap-4">
      <section className="rounded-lg border border-slate-800 bg-slate-950/35 p-4">
        <div className="grid gap-3 md:grid-cols-6">
          <SelectField
            label="優先"
            value={filters.priority}
            onChange={(value) => setFilters((current) => ({ ...current, priority: value }))}
          >
            <option value="all">全部</option>
            <option value="high">高</option>
            <option value="medium">中</option>
            <option value="low">低</option>
          </SelectField>
          <SelectField
            label="材料"
            value={filters.materialId}
            onChange={(value) => setFilters((current) => ({ ...current, materialId: value }))}
          >
            <option value="all">全部</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.displayName}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="參數"
            value={filters.parameterKey}
            onChange={(value) => setFilters((current) => ({ ...current, parameterKey: value }))}
          >
            <option value="all">全部</option>
            {uniqueParameterKeys(todos).map((key) => (
              <option key={key} value={key}>
                {formatParameterKey(key)}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="狀態"
            value={filters.status}
            onChange={(value) => setFilters((current) => ({ ...current, status: value }))}
          >
            <option value="all">全部</option>
            <option value="todo">待查</option>
            <option value="in_progress">查找中</option>
            <option value="candidate_found">已有候選</option>
            <option value="reviewed">已檢閱</option>
            <option value="verified">已驗證</option>
          </SelectField>
          <SelectField
            label="候選證據"
            value={filters.candidateState}
            onChange={(value) =>
              setFilters((current) => ({ ...current, candidateState: value }))
            }
          >
            <option value="all">全部</option>
            <option value="with_candidate">已有候選證據</option>
            <option value="without_candidate">尚無候選證據</option>
          </SelectField>
          <label className="text-xs font-medium text-slate-400">
            搜尋
            <input
              className="field-input mt-2"
              placeholder="材料、原因、搜尋詞"
              value={filters.searchText}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  searchText: event.target.value,
                }))
              }
            />
          </label>
        </div>
      </section>

      <div className="grid gap-3">
        {filteredTodos.map((todo) => (
          <TodoCard
            evidence={evidence}
            key={todo.id}
            todo={todo}
            onCreateEvidenceFromTodo={onCreateEvidenceFromTodo}
            onUpdateTodo={updateTodo}
          />
        ))}
      </div>
    </section>
  )
}

function TodoCard({
  evidence,
  todo,
  onCreateEvidenceFromTodo,
  onUpdateTodo,
}: {
  evidence: ParameterEvidence[]
  todo: MaterialLiteratureTodo
  onCreateEvidenceFromTodo: (todo: MaterialLiteratureTodo) => void
  onUpdateTodo: (todoId: string, updates: Partial<MaterialLiteratureTodo>) => void
}) {
  const candidateEvidenceCount = evidence.filter(
    (item) =>
      item.materialIds.includes(todo.materialId) &&
      item.parameterKey === todo.parameterKey,
  ).length

  return (
          <article
            className="rounded-lg border border-slate-800 bg-slate-950/35 p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
                    {getMaterialName(todo.materialId)}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
                    {formatParameterKey(todo.parameterKey)}
                  </span>
                  <span className="rounded-full border border-amber-800 bg-amber-950/25 px-2.5 py-1 text-amber-100">
                    優先 {formatTodoPriority(todo.priority)}
                  </span>
                  <span className="rounded-full border border-cyan-800 bg-cyan-950/25 px-2.5 py-1 text-cyan-100">
                    {formatTodoStatus(todo.status)}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-slate-300">
                    候選證據 {candidateEvidenceCount}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {todo.reason_zh}
                </p>
              </div>
              <button
                className="primary-button shrink-0"
                onClick={() => onCreateEvidenceFromTodo(todo)}
                type="button"
              >
                從此待查項目建立參數證據
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-400">
              {todo.suggestedSearchTerms.map((term) => (
                <span
                  className="rounded-full border border-slate-800 bg-slate-900 px-2 py-1"
                  key={term}
                >
                  {term}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <LiteratureReviewWorkflow
                currentStatus={todo.status}
                mode="todo"
                onChangeStatus={(status) =>
                  onUpdateTodo(todo.id, {
                    status: status as MaterialLiteratureTodo['status'],
                  })
                }
              />
            </div>

            <label className="mt-3 block text-xs font-medium text-slate-400">
              備註
              <input
                className="field-input mt-2"
                value={todo.notes_zh ?? ''}
                onChange={(event) =>
                  onUpdateTodo(todo.id, { notes_zh: event.target.value })
                }
              />
            </label>
          </article>
  )
}

function SelectField({
  children,
  label,
  onChange,
  value,
}: {
  children: ReactNode
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="text-xs font-medium text-slate-400">
      {label}
      <select
        className="field-input mt-2"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  )
}


function uniqueParameterKeys(todos: MaterialLiteratureTodo[]) {
  return [...new Set(todos.map((todo) => todo.parameterKey))]
}

function getMaterialName(materialId: string) {
  return materials.find((material) => material.id === materialId)?.displayName ?? materialId
}
