// Shared geometry for the floor map. Used both by the on-screen SVG editor
// and by the canvas renderer that produces the final PNG sent over WhatsApp.

export type ShapeKind = 'rect' | 'triangle' | 'rect-diag';

export interface MapShape {
  id: string;
  kind: ShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  label?: string;
  /** Only interactive (blue) shapes can receive names/comments. */
  interactive: boolean;
  rx?: number;
  /** For 'rect-diag': how many corner-to-corner lines to draw (1 or 2). */
  diagonalLines?: number;
}

export const CANVAS_WIDTH = 964;
export const CANVAS_HEIGHT = 714;

export const COLORS = {
  blue: '#5aa9e6',
  red: '#e05c6e',
  white: '#f2f2f2',
  green: '#54c07d',
  orange: '#e0982f',
  background: '#141414',
};

export const mapShapes: MapShape[] = [
  // ---- Decorative shapes (not editable) ----
  { id: 'produccion', kind: 'rect', x: 18, y: 22, width: 130, height: 68, color: COLORS.red, label: 'producción', interactive: false, rx: 10 },
  { id: 'tarima', kind: 'rect', x: 296, y: 14, width: 392, height: 152, color: COLORS.red, label: 'Tarima', interactive: false, rx: 10 },
  { id: 'banos', kind: 'rect', x: 18, y: 202, width: 82, height: 172, color: COLORS.white, label: 'Baños', interactive: false, rx: 10 },
  { id: 'blank-white', kind: 'rect', x: 18, y: 442, width: 100, height: 148, color: COLORS.white, interactive: false, rx: 10 },
  { id: 'cafeteria', kind: 'rect', x: 18, y: 598, width: 276, height: 92, color: COLORS.white, label: 'Cafeteria', interactive: false, rx: 6 },
  { id: 'libreria', kind: 'rect', x: 368, y: 598, width: 288, height: 84, color: COLORS.white, label: 'Libreria', interactive: false, rx: 6 },
  { id: 'recepcion', kind: 'rect', x: 746, y: 370, width: 196, height: 154, color: COLORS.green, label: 'Recepción', interactive: false, rx: 10 },
  { id: 'recepcion-small', kind: 'rect', x: 828, y: 468, width: 108, height: 56, color: COLORS.green, interactive: false, rx: 8 },
  { id: 'predicador', kind: 'rect', x: 746, y: 538, width: 196, height: 84, color: COLORS.orange, label: 'Predicador', interactive: false, rx: 8 },

  // ---- Interactive (blue) shapes: these can be clicked to add names/comments ----
  { id: 'sec-1', kind: 'rect', x: 157, y: 32, width: 127, height: 55, color: COLORS.blue, interactive: true, rx: 10 },
  { id: 'sec-2', kind: 'rect', x: 157, y: 108, width: 127, height: 32, color: COLORS.blue, interactive: true, rx: 10 },
  { id: 'sec-3', kind: 'rect', x: 706, y: 30, width: 212, height: 102, color: COLORS.blue, interactive: true, rx: 10 },
  { id: 'sec-4', kind: 'triangle', x: 150, y: 172, width: 118, height: 182, color: COLORS.blue, interactive: true },
  { id: 'sec-5', kind: 'rect', x: 308, y: 172, width: 170, height: 182, color: COLORS.blue, interactive: true, rx: 10 },
  { id: 'sec-6', kind: 'rect', x: 540, y: 172, width: 147, height: 182, color: COLORS.blue, interactive: true, rx: 10 },
  { id: 'sec-7', kind: 'rect-diag', x: 718, y: 168, width: 186, height: 186, color: COLORS.blue, interactive: true, diagonalLines: 2 },
  { id: 'sec-8', kind: 'rect', x: 197, y: 380, width: 70, height: 180, color: COLORS.blue, interactive: true, rx: 14 },
  { id: 'sec-9', kind: 'rect', x: 308, y: 380, width: 120, height: 180, color: COLORS.blue, interactive: true, rx: 14 },
  { id: 'sec-10', kind: 'rect', x: 463, y: 380, width: 57, height: 180, color: COLORS.blue, interactive: true, rx: 14 },
  { id: 'sec-11', kind: 'rect', x: 563, y: 380, width: 135, height: 180, color: COLORS.blue, interactive: true, rx: 14 },
];

export const interactiveShapes = mapShapes.filter((s) => s.interactive);

/** Triangle points for the wedge-shaped section (sec-4), as an SVG points string. */
export function trianglePoints(shape: MapShape): string {
  const { x, y, width, height } = shape;
  return `${x + width},${y} ${x + width},${y + height} ${x},${y + height}`;
}

export interface SectionEntry {
  name: string;
  comment?: string;
}

export type SectionsState = Record<string, SectionEntry[]>;

export function emptySectionsState(): SectionsState {
  const state: SectionsState = {};
  for (const s of interactiveShapes) state[s.id] = [];
  return state;
}
