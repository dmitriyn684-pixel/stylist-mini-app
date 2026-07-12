/** Загружает File в HTMLImageElement */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Не удалось загрузить изображение'));
    img.src = url;
  });
}

/**
 * Сжимает фото до maxDim по большей стороне и возвращает canvas (для дальнейшего
 * анализа — цвет/категория) вместе с компактным data URL (для хранения в localStorage,
 * полноразмерные фото туда не влезут).
 */
export function resizeToCanvas(image: HTMLImageElement, maxDim = 480): HTMLCanvasElement {
  const scale = Math.min(1, maxDim / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D недоступен');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

export function canvasToDataUrl(canvas: HTMLCanvasElement, quality = 0.82): string {
  return canvas.toDataURL('image/jpeg', quality);
}
