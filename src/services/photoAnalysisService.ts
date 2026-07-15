import type { ColorAnalysisResult } from '../types/analysis';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface PhotoScanResult extends ColorAnalysisResult {
  skinUndertone: string;
  contrastLevel: string;
  confidence: number;
}

/**
 * Реальный вызов Gemini Vision через бэкенд (/api/scan-photo). Отдаёт тот же
 * формат, что и ColorAnalysisResult от бота — вызывающий код сохраняет его
 * через useColorAnalysis().save(), и результат сразу подхватывают Профиль,
 * Стилист и чат.
 */
export async function scanPhoto(imageDataUrl: string): Promise<PhotoScanResult> {
  const [meta, base64] = imageDataUrl.split(',');
  if (!base64) throw new Error('Некорректное изображение');
  const mimeType = /data:(.*?);base64/.exec(meta)?.[1] ?? 'image/jpeg';

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/scan-photo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64: base64, mimeType }),
    });
  } catch {
    throw new Error('Не удалось подключиться к серверу анализа. Проверь соединение.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Сервер вернул ошибку ${res.status}`);
  }
  return data.analysis as PhotoScanResult;
}
