'use client';
import { useState, useRef } from 'react';
import { ArrowUpRight, Search, CornerDownLeft, ArrowDown, ArrowUp } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

export type CommandAction = { label: string; group: string; action: () => void };

export function CommandPalette({ commands, onClose }: { commands: CommandAction[]; onClose: () => void }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const filtered = commands.filter(command => command.label.toLowerCase().includes(search.toLowerCase()));
  function select(index: number) {
    const next = (index + filtered.length) % filtered.length;
    setSelected(next);
    list.current?.children[next]?.scrollIntoView({ block: 'nearest' });
  }
  return <Modal label="Command palette" onClose={onClose} className="palette-overlay">
    <div className="palette-title eyebrow">A SHORTCUT TO EVERYTHING</div>
    <div className="palette-search"><Search size={20} />
      <input data-autofocus role="combobox" aria-label="Search portfolio commands" aria-controls="command-results" aria-expanded="true" aria-autocomplete="list" aria-activedescendant={filtered.length ? `command-${selected}` : undefined} placeholder="Where would you like to go?" value={search}
        onChange={event => { setSearch(event.target.value); setSelected(0); }}
        onKeyDown={event => {
          if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && filtered.length) { event.preventDefault(); select(selected + (event.key === 'ArrowDown' ? 1 : -1)); }
          if (event.key === 'Enter') { event.preventDefault(); filtered[selected]?.action(); }
        }} />
    </div>
    <div id="command-results" role="listbox" aria-label="Portfolio actions" className="palette-results" ref={list}>
      {filtered.map((command, index) => <div id={`command-${index}`} key={command.label} role="option" aria-selected={selected === index} className={selected === index ? 'selected' : ''}>
        <button tabIndex={-1} onClick={command.action} onPointerMove={() => setSelected(index)}><span>{command.label}<small>{command.group}</small></span><ArrowUpRight size={17} /></button>
      </div>)}
    </div>
    {!filtered.length && <p className="empty-results" role="status">No matching actions. Try “projects” or “theme”.</p>}
    <div className="palette-foot"><span><ArrowUp size={12} /><ArrowDown size={12} /> Navigate</span><span><CornerDownLeft size={12} /> Select</span><span><kbd>Esc</kbd> Close</span></div>
  </Modal>;
}
