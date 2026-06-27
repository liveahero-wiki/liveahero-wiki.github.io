// Downshift combobox for the "Has status" filter. Suggests statuses by
// case-insensitive substring of their name; selected ones render as removable
// chips with their icon. Supports multiple statuses.

import { useCombobox } from 'downshift'
import { useMemo, useState } from 'preact/hooks'
import { statusIcon } from '../lib/urls.js'

export function StatusAutocomplete({ statuses, selected, onAdd, onRemove }) {
  const [input, setInput] = useState('')

  // Stable list of { id, name, icon, type } from the statuses dict.
  const all = useMemo(
    () =>
      Object.entries(statuses).map(([id, s]) => ({
        id: Number(id),
        ...s,
      })),
    [statuses],
  )

  const items = useMemo(() => {
    const q = input.trim().toLowerCase()
    return all
      .filter((s) => !selected.has(s.id))
      .filter((s) => !q || s.name.toLowerCase().includes(q))
      .slice(0, 20)
  }, [all, input, selected])

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
  } = useCombobox({
    items,
    inputValue: input,
    selectedItem: null,
    itemToString: (i) => (i ? i.name : ''),
    onInputValueChange: ({ inputValue }) => setInput(inputValue ?? ''),
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        onAdd(selectedItem.id)
        setInput('')
      }
    },
  })

  return (
    <div class="status-ac">
      <div class="chips">
        {[...selected].map((id) => {
          const s = statuses[id]
          if (!s) return null
          return (
            <span key={id} class="status-chip">
              <img src={statusIcon(s.icon)} alt="" loading="lazy" />
              {s.name}
              <button type="button" onClick={() => onRemove(id)} aria-label="remove">
                ×
              </button>
            </span>
          )
        })}
        <input
          {...getInputProps({ placeholder: 'Type a status…' })}
          class="status-input"
        />
      </div>
      <ul {...getMenuProps()} class={'ac-menu' + (isOpen && items.length ? ' open' : '')}>
        {isOpen &&
          items.map((item, index) => (
            <li
              key={item.id}
              {...getItemProps({ item, index })}
              class={'ac-item' + (highlightedIndex === index ? ' hl' : '')}
            >
              <img src={statusIcon(item.icon)} alt="" loading="lazy" />
              <span>{item.name}</span>
              <span class="ac-type">{item.type}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}
