// Result table (one row per skill) built on TanStack Table, with sorting.

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMemo, useState } from 'preact/hooks'
import { charaLink, portrait, statusIcon } from '../lib/urls.js'
import { SkillDescription } from './SkillDescription.jsx'

const SLOT_LABEL = {
  active1: 'Active 1',
  active2: 'Active 2',
  active3: 'Active 3',
  passive: 'Passive',
  sidekick_active: 'SK Active',
  sidekick_passive: 'SK Passive',
}

export function ResultTable({ rows, statuses }) {
  const [sorting, setSorting] = useState([])

  const columns = useMemo(
    () => [
      {
        id: 'character',
        header: 'Character',
        accessorKey: 'name',
        size: 180,
        cell: ({ row }) => {
          const e = row.original.entity
          return (
            <a class="chara-cell" href={charaLink(e)} target="_blank" rel="noreferrer">
              <img
                class="chara-icon"
                src={portrait(e)}
                alt=""
                loading="lazy"
                onError={(ev) => {
                  ev.target.style.visibility = 'hidden'
                }}
              />
              <span>{e.name}</span>
              {e.isMob && <span class="mob-tag">mob</span>}
            </a>
          )
        },
      },
      {
        id: 'kind',
        header: 'Type',
        accessorKey: 'kind',
        size: 90,
        cell: ({ getValue }) => (getValue() === 'hero' ? 'Hero' : 'Sidekick'),
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
                {r.statusIds.map((id) => {
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
              <SkillDescription html={r.description} />
            </div>
          )
        },
      },
      {
        id: 'useView',
        header: 'View Cost',
        accessorKey: 'useView',
        size: 100,
        cell: ({ getValue }) => getValue().toLocaleString(),
      },
    ],
    [statuses],
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div class="table-wrap">
      <table class="result-table" style={{ width: table.getCenterTotalSize() }}>
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
                    {{ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted()] ?? ''}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} style={{ width: cell.column.getSize() }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
