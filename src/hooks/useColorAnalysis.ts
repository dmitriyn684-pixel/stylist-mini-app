import { useCallback, useEffect, useState } from 'react';
import type { ColorAnalysisResult } from '../types/analysis';
import { PROFILE_SYNCED_EVENT } from './useTelegram';

const KEY = 'color_analysis_result';

function readFromStorage(): ColorAnalysisResult | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as ColorAnalysisResult) : null;
}

export function useColorAnalysis() {
  const [result, setResult] = useState<ColorAnalysisResult | null>(readFromStorage);

  // useState читает localStorage один раз при монтировании — если экран
  // отрендерился раньше, чем мост (useTelegram) успел получить ответ от
  // backend и записать сюда данные, result так и останется прежним без
  // этой подписки. См. PROFILE_SYNCED_EVENT в useTelegram.ts.
  useEffect(() => {
    const onSynced = () => setResult(readFromStorage());
    window.addEventListener(PROFILE_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(PROFILE_SYNCED_EVENT, onSynced);
  }, []);

  const save = useCallback((value: ColorAnalysisResult) => {
    localStorage.setItem(KEY, JSON.stringify(value));
    setResult(value);
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem(KEY);
    setResult(null);
  }, []);

  return { result, save, clear };
}
