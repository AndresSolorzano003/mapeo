'use client';

import { useEffect, useState } from 'react';
import {
  mapShapes,
  trianglePoints,
  emptySectionsState,
  SectionsState,
  SectionEntry,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
} from '../lib/mapLayout';
import { renderMapToDataUrl } from '../lib/renderMapImage';
import { sendMapImage } from '../lib/api';
import SectionModal from './SectionModal';

const STORAGE_KEY = 'mapa-planta-sections-v1';

type SendStatus =
  | { state: 'idle' }
  | { state: 'sending' }
  | { state: 'success'; message: string }
  | { state: 'error'; message: string };

export default function MapEditor() {
  const [sections, setSections] = useState<SectionsState>(emptySectionsState());
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [status, setStatus] = useState<SendStatus>({ state: 'idle' });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSections({ ...emptySectionsState(), ...JSON.parse(saved) });
    } catch {
      // ignore corrupted local storage
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sections));
    } catch {
      // storage full or unavailable, ignore
    }
  }, [sections]);

  const totalEntries = Object.values(sections).reduce((sum, arr) => sum + arr.length, 0);

  function addEntry(sectionId: string, entry: SectionEntry) {
    setSections((prev) => ({ ...prev, [sectionId]: [...(prev[sectionId] ?? []), entry] }));
  }

  function removeEntry(sectionId: string, index: number) {
    setSections((prev) => ({
      ...prev,
      [sectionId]: (prev[sectionId] ?? []).filter((_, i) => i !== index),
    }));
  }

  function handleGenerate(): string {
    const dataUrl = renderMapToDataUrl(sections, 'Mapa de planta');
    setPreviewUrl(dataUrl);
    return dataUrl;
  }

  function handleDownload() {
    const dataUrl = handleGenerate();
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'mapa-planta.png';
    link.click();
  }

  async function handleSend() {
    const dataUrl = handleGenerate();
    setStatus({ state: 'sending' });
    try {
      const result = await sendMapImage(dataUrl, 'Mapa de planta');
      if (result.success) {
        setStatus({ state: 'success', message: result.message });
      } else {
        setStatus({ state: 'error', message: result.message });
      }
    } catch (err) {
      setStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'No se pudo conectar con el servidor',
      });
    }
  }

  const active = mapShapes.find((s) => s.id === activeSection);

  return (
    <div className="editor-layout">
      <div className="map-wrapper">
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          className="map-svg"
          role="img"
          aria-label="Mapa de planta"
        >
          <rect x={2} y={2} width={CANVAS_WIDTH - 4} height={CANVAS_HEIGHT - 4} rx={16} fill="#141414" stroke="#ffffff" strokeWidth={3} />

          {mapShapes.map((shape) => {
            const entries = sections[shape.id] ?? [];
            const isInteractive = shape.interactive;
            const commonProps = {
              stroke: shape.color,
              strokeWidth: 2.5,
              fill: isInteractive ? 'rgba(90,169,230,0.08)' : 'transparent',
            };

            return (
              <g
                key={shape.id}
                className={isInteractive ? 'shape interactive' : 'shape'}
                onClick={() => isInteractive && setActiveSection(shape.id)}
              >
                {shape.kind === 'rect' && (
                  <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx ?? 8} {...commonProps} />
                )}
                {shape.kind === 'rect-diag' && (
                  <>
                    <rect x={shape.x} y={shape.y} width={shape.width} height={shape.height} rx={shape.rx ?? 8} {...commonProps} />
                    <line x1={shape.x} y1={shape.y} x2={shape.x + shape.width} y2={shape.y + shape.height} stroke={shape.color} strokeWidth={2} />
                    {(shape.diagonalLines ?? 1) > 1 && (
                      <line
                        x1={shape.x + shape.width * 0.15}
                        y1={shape.y + shape.height}
                        x2={shape.x + shape.width}
                        y2={shape.y + shape.height * 0.15}
                        stroke={shape.color}
                        strokeWidth={2}
                      />
                    )}
                  </>
                )}
                {shape.kind === 'triangle' && <polygon points={trianglePoints(shape)} {...commonProps} />}

                {shape.label && (
                  <text
                    x={shape.x + shape.width / 2}
                    y={shape.y + shape.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#ffffff"
                    fontSize={shape.width > 250 ? 30 : 18}
                    fontFamily="'Comic Sans MS', 'Segoe UI', sans-serif"
                  >
                    {shape.label}
                  </text>
                )}

                {isInteractive && (
                  <foreignObject x={shape.x + 4} y={shape.y + 4} width={shape.width - 8} height={shape.height - 8}>
                    <div className="section-content">
                      {entries.length === 0 ? (
                        <span className="section-placeholder">+ agregar</span>
                      ) : (
                        <>
                          <span className="section-name">{entries[0].name}</span>
                          {entries.length > 1 && <span className="section-more">+{entries.length - 1} más</span>}
                        </>
                      )}
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
        <p className="scroll-hint">Desliza el mapa hacia los lados para ver todas las secciones →</p>
      </div>

      <div className="side-panel">
        <h1>Mapa de planta</h1>
        <p>Haz clic en cualquier sección azul para agregar los nombres que necesites.</p>
        <p className="counter">{totalEntries} nombre(s) agregado(s)</p>

        <div className="actions">
          <button className="secondary-btn" onClick={handleDownload}>
            Descargar imagen
          </button>
          <button className="primary-btn" onClick={handleSend} disabled={status.state === 'sending'}>
            {status.state === 'sending' ? 'Enviando…' : 'Finalizar y enviar por WhatsApp'}
          </button>
        </div>

        {status.state === 'success' && <div className="status status-success">{status.message}</div>}
        {status.state === 'error' && <div className="status status-error">{status.message}</div>}

        {previewUrl && (
          <div className="preview">
            <p>Vista previa de la imagen final:</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Vista previa del mapa" />
          </div>
        )}
      </div>

      {active && (
        <SectionModal
          sectionId={active.id}
          sectionLabel={`Sección ${active.id.replace('sec-', '')}`}
          entries={sections[active.id] ?? []}
          onAdd={(entry) => addEntry(active.id, entry)}
          onRemove={(index) => removeEntry(active.id, index)}
          onClose={() => setActiveSection(null)}
        />
      )}
    </div>
  );
}
