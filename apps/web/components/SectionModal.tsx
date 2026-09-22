'use client';

import { useState } from 'react';
import { SectionEntry } from '../lib/mapLayout';

interface Props {
  sectionId: string;
  sectionLabel: string;
  entries: SectionEntry[];
  onAdd: (entry: SectionEntry) => void;
  onRemove: (index: number) => void;
  onClose: () => void;
}

export default function SectionModal({ sectionLabel, entries, onAdd, onRemove, onClose }: Props) {
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, comment: comment.trim() || undefined });
    setName('');
    setComment('');
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{sectionLabel}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <label>
            Nombre
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Ej: Juan Pérez"
            />
          </label>
          <label>
            Comentario (opcional)
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej: silla adicional, mesa de esquina, etc."
              rows={2}
            />
          </label>
          <button className="primary-btn" onClick={handleAdd} disabled={!name.trim()}>
            Agregar
          </button>

          {entries.length > 0 && (
            <ul className="entry-list">
              {entries.map((entry, i) => (
                <li key={i}>
                  <div>
                    <strong>{entry.name}</strong>
                    {entry.comment && <div className="entry-comment">{entry.comment}</div>}
                  </div>
                  <button className="icon-btn" onClick={() => onRemove(i)} aria-label="Eliminar">
                    🗑
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
