import type { ColorAnalysisResult } from '../types/analysis';

export function downloadPaletteImage(result: ColorAnalysisResult) {
  const swatches = [
    ...result.palette.base.map((s) => ({ ...s, group: 'Базовые' })),
    ...result.palette.accent.map((s) => ({ ...s, group: 'Акцентные' })),
  ];

  const cols = 4;
  const cellW = 160;
  const cellH = 190;
  const rows = Math.ceil(swatches.length / cols);
  const padding = 40;
  const headerH = 100;

  const canvas = document.createElement('canvas');
  canvas.width = cols * cellW + padding * 2;
  canvas.height = headerH + rows * cellH + padding;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = '#FBF5EC';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#2B2118';
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(result.seasonalType, padding, 50);
  ctx.font = '15px Arial, sans-serif';
  ctx.fillStyle = '#55493C';
  ctx.fillText('Stylist AI — твоя палитра', padding, 78);

  swatches.forEach((s, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * cellW;
    const y = headerH + row * cellH;

    ctx.fillStyle = s.hex;
    ctx.beginPath();
    const r = 16;
    const w = cellW - 20;
    const h = 120;
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#2B2118';
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(s.name, x, y + h + 22);
    ctx.fillStyle = '#A79C87';
    ctx.font = '12px monospace';
    ctx.fillText(s.hex.toUpperCase(), x, y + h + 40);
  });

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stylist-ai-palette-${result.seasonalType.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
