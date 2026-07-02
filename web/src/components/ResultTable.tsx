// Result table (one row per skill) built on TanStack Table, with sorting.

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState } from 'preact/hooks'
import type { Category, Entity, Row, Status } from '../types'
import { charaLink, portrait, statusIcon } from '../lib/urls'
import { SkillDescription } from './SkillDescription'

const SLOT_LABEL: Record<string, string> = {
  active1: 'Active 1',
  active2: 'Active 2',
  active3: 'Active 3',
  passive: 'Passive',
  sidekick_active: 'SK Active',
  sidekick_passive: 'SK Passive',
  sidekick_append: 'SK Append',
}

export function dedupByName(ids: number[], statuses: Record<string, Status>): number[] {
  const seen = new Set<string>()
  return ids.filter((id) => {
    const name = statuses[id]?.name
    if (!name || seen.has(name)) return false
    seen.add(name)
    return true
  })
}

interface ResultTableProps {
  rows: Row[]
  statuses: Record<string, Status>
  onOpenKit: (entity: Entity) => void
  showLabels: boolean
  categories: Category[]
}

export function ResultTable({ rows, statuses, onOpenKit, showLabels, categories }: ResultTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const labelMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const cat of categories)
      for (const l of cat.labels) m.set(l.key, l.label)
    return m
  }, [categories])

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: 'character',
        header: 'Character',
        accessorKey: 'name',
        size: 240,
        cell: ({ row }) => {
          const e = row.original.entity
          return (
            <div class="chara-cell">
              <a class="chara-link" href={charaLink(e)} target="_blank" rel="noreferrer">
                <img
                  class="chara-icon"
                  src={portrait(e)}
                  alt=""
                  loading="lazy"
                  onError={(ev) => {
                    ev.currentTarget.style.visibility = 'hidden'
                  }}
                />
                <span>{e.name}</span>
                {e.isMob && <span class="mob-tag">mob</span>}
              </a>
              <button
                type="button"
                class="kit-btn"
                title="Show full skill kit"
                onClick={() => onOpenKit(e)}
              >
                Kit
              </button>
            </div>
          )
        },
      },
      {
        id: 'kind',
        header: 'Type',
        accessorKey: 'kind',
        size: 80,
        cell: ({ row }) => (row.original.kind === 'hero' ? 'Hero' : 'Sidekick'),
      },
      {
        id: 'skill',
        header: 'Skill',
        accessorKey: 'skillName',
        size: 480,
        cell: ({ row }) => {
          const r = row.original
          return (
            <div class="skill-cell">
              <div class="skill-head">
                <span class="slot-badge">{SLOT_LABEL[r.slot] ?? r.slot}</span>
                <span class="skill-name">{r.skillName}</span>
                {dedupByName(r.statusIds, statuses).map((id) => {
                  const s = statuses[id]
                  return s ? (
                    <img
                      key={id}
                      class="inline-status"
                      src={statusIcon(s.icon)}
                      title={s.name}
                      alt={s.name}
                      loading="lazy"
                    />
                  ) : null
                })}
              </div>
              <SkillDescription html={r.description} changeSkills={r.changeSkills} statusDescs={r.statusDescs} />
            </div>
          )
        },
      },
      ...(showLabels
        ? [
            {
              id: 'labels',
              header: 'Labels',
              accessorKey: 'labels',
              size: 220,
              cell: ({ row }: { row: { original: Row } }) =>
                row.original.labels
                  .map((k) => labelMap.get(k) ?? k)
                  .sort()
                  .join(', '),
            } satisfies ColumnDef<Row>,
          ]
        : []),
      {
        id: 'useView',
        header: 'View Cost',
        accessorKey: 'useView',
        size: 100,
        cell: ({ row }) => row.original.useView.toLocaleString(),
      },
    ],
    [statuses, onOpenKit, showLabels, labelMap],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const { rows: tableRows } = table.getRowModel()
  const totalWidth = table.getCenterTotalSize()

  // Virtualize the rows so only the visible window is rendered. Without this,
  // every filter/sort toggle reconciles all ~1,200 rows (each with a
  // dangerouslySetInnerHTML description + images) — the slow click in the trace.
  const scrollRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 56,
    overscan: 12,
    getItemKey: (index) => tableRows[index].id,
  })
  const virtualRows = virtualizer.getVirtualItems()

  return (
    <div ref={scrollRef} class="table-wrap">
      <table class="result-table" style={{ width: totalWidth }}>
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th key={header.id} style={{ width: header.getSize() }}>
                  <span
                    class={'th-label' + (header.column.getCanSort() ? ' sortable' : '')}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody style={{ height: virtualizer.getTotalSize() }}>
          {virtualRows.map((vRow) => {
            const row = tableRows[vRow.index]
            return (
              <tr
                key={row.id}
                data-index={vRow.index}
                ref={virtualizer.measureElement}
                style={{ transform: `translateY(${vRow.start}px)` }}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
