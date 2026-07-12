import { useCallback, useState } from 'react';
import type { ColorAnalysisResult } from '../types/analysis';

const KEY = 'color_analysis_result';

export function useColorAnalysis() {
  const [result, setResult] = useState<ColorAnalysisResult | null>(() => {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ColorAnalysisResult) : null;
  });

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
