import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, mapShapes, trianglePoints, SectionsState } from './mapLayout';

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Draws the full floor map, including the names/comments entered for each
 * blue section, onto a canvas and returns a PNG data URL.
 */
export function renderMapToDataUrl(sections: SectionsState, title?: string): string {
  const padding = 40;
  const headerHeight = title ? 60 : 0;
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH + padding * 2;
  canvas.height = CANVAS_HEIGHT + padding * 2 + headerHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear el contexto de canvas');

  // Background
  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (title) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Segoe UI, Arial, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(title, padding, 16);
  }

  ctx.save();
  ctx.translate(padding, padding + headerHeight);

  // Outer border of the map
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  roundRectPath(ctx, 4, 4, CANVAS_WIDTH - 8, CANVAS_HEIGHT - 8, 16);
  ctx.stroke();

  for (const shape of mapShapes) {
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = shape.color;

    if (shape.kind === 'rect') {
      roundRectPath(ctx, shape.x, shape.y, shape.width, shape.height, shape.rx ?? 8);
      ctx.stroke();
    } else if (shape.kind === 'rect-diag') {
      roundRectPath(ctx, shape.x, shape.y, shape.width, shape.height, shape.rx ?? 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(shape.x, shape.y);
      ctx.lineTo(shape.x + shape.width, shape.y + shape.height);
      if ((shape.diagonalLines ?? 1) > 1) {
        ctx.moveTo(shape.x + shape.width * 0.15, shape.y + shape.height);
        ctx.lineTo(shape.x + shape.width, shape.y + shape.height * 0.15);
      }
      ctx.stroke();
    } else if (shape.kind === 'triangle') {
      const points = trianglePoints(shape)
        .split(' ')
        .map((p) => p.split(',').map(Number));
      ctx.beginPath();
      ctx.moveTo(points[0][0], points[0][1]);
      for (const [px, py] of points.slice(1)) ctx.lineTo(px, py);
      ctx.closePath();
      ctx.stroke();
    }

    // Decorative label (non-interactive shapes)
    if (shape.label) {
      ctx.fillStyle = '#ffffff';
      ctx.font = shape.width > 250 ? 'bold 30px Segoe UI, Arial, sans-serif' : '18px Segoe UI, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(shape.label, shape.x + shape.width / 2, shape.y + shape.height / 2);
    }

    // Names/comments entered for interactive (blue) sections
    if (shape.interactive) {
      const entries = sections[shape.id] ?? [];
      const innerPad = 8;
      const maxWidth = shape.width - innerPad * 2;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Segoe UI, Arial, sans-serif';
      let cursorY = shape.y + innerPad;

      if (entries.length === 0) {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '12px Segoe UI, Arial, sans-serif';
        ctx.fillText('(sin asignar)', shape.x + innerPad, cursorY);
      } else {
        for (const entry of entries) {
          ctx.font = 'bold 13px Segoe UI, Arial, sans-serif';
          ctx.fillStyle = '#ffffff';
          const nameLines = wrapText(ctx, entry.name, maxWidth);
          for (const line of nameLines) {
            if (cursorY > shape.y + shape.height - innerPad) break;
            ctx.fillText(line, shape.x + innerPad, cursorY);
            cursorY += 16;
          }
          if (entry.comment) {
            ctx.font = '11px Segoe UI, Arial, sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.75)';
            const commentLines = wrapText(ctx, entry.comment, maxWidth);
            for (const line of commentLines) {
              if (cursorY > shape.y + shape.height - innerPad) break;
              ctx.fillText(line, shape.x + innerPad, cursorY);
              cursorY += 14;
            }
          }
          cursorY += 4;
        }
      }
    }
  }

  ctx.restore();

  return canvas.toDataURL('image/png');
}
