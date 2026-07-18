export interface ColorGuess {
  hex: string;
  /** Доля пикселей, попавших в победивший бакет, от всех учтённых — честная
   *  мера того, насколько вещь однотонная на фото (не выдуманная оценка). */
  confidence: number;
}

/**
 * Определение доминантного цвета вещи по фото — честный автоматический анализ
 * пикселей (не заглушка), но без сегментации объекта: если на фото светлый
 * однотонный фон (частый случай для товарных фото), почти белые пиксели
 * исключаются из подсчёта, чтобы не спутать фон с самой вещью.
 */
export function extractDominantColor(canvas: HTMLCanvasElement): ColorGuess {
  const ctx = canvas.getContext('2d');
  if (!ctx) return { hex: '#C9BFAE', confidence: 0 };

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = new Map<string, { count: number; r: number; g: number; b: number }>();
  const STEP = 4; // шаг сэмплирования пикселей — не читаем каждый, для скорости
  const QUANT = 24; // размер бакета квантования по каждому каналу
  let totalSamples = 0;

  for (let i = 0; i < data.length; i += 4 * STEP) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alpha = data[i + 3];
    if (alpha < 200) continue;
    // Похоже на белый/светло-серый фон товарного фото — пропускаем
    if (r > 235 && g > 235 && b > 235) continue;

    totalSamples++;
    const key = `${Math.round(r / QUANT)}_${Math.round(g / QUANT)}_${Math.round(b / QUANT)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.count++;
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
    } else {
      buckets.set(key, { count: 1, r, g, b });
    }
  }

  if (buckets.size === 0 || totalSamples === 0) return { hex: '#C9BFAE', confidence: 0 };

  let best = { count: 0, r: 0, g: 0, b: 0 };
  for (const bucket of buckets.values()) {
    if (bucket.count > best.count) best = bucket;
  }

  const r = Math.round(best.r / best.count);
  const g = Math.round(best.g / best.count);
  const b = Math.round(best.b / best.count);
  const confidence = Math.round((best.count / totalSamples) * 100);
  return { hex: rgbToHex(r, g, b), confidence };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => v.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
