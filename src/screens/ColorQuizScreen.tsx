import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { OptionPill } from '../components/ui/OptionPill';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { determineColorType } from '../utils/colorTypes';
import type { ClothingPref, ColorQuizAnswers, Contrast, Warmth } from '../types/analysis';

const skinToneOptions: { value: Warmth; label: string }[] = [
  { value: 'cold', label: 'Холодный' },
  { value: 'warm', label: 'Тёплый' },
  { value: 'unknown', label: 'Не знаю' },
];

const contrastOptions: { value: Contrast; label: string }[] = [
  { value: 'high', label: 'Высокая' },
  { value: 'medium', label: 'Средняя' },
  { value: 'low', label: 'Низкая' },
];

const hairOptions = [
  { value: 'Чёрный', hex: '#1B1410' },
  { value: 'Тёмно-русый', hex: '#3B2A21' },
  { value: 'Русый', hex: '#6F4E37' },
  { value: 'Светло-русый', hex: '#A97C50' },
  { value: 'Блонд', hex: '#D8B978' },
  { value: 'Рыжий', hex: '#A5502A' },
  { value: 'Седой', hex: '#B9B4AC' },
];

const eyeOptions = [
  { value: 'Карие', hex: '#4B2E1E' },
  { value: 'Тёмно-карие', hex: '#2B1B12' },
  { value: 'Ореховые', hex: '#7C6A4B' },
  { value: 'Зелёные', hex: '#4C7A5A' },
  { value: 'Голубые', hex: '#6FA8C7' },
  { value: 'Серые', hex: '#8A8D93' },
];

const clothingOptions: { value: ClothingPref; label: string }[] = [
  { value: 'warm', label: 'Тёплые тона' },
  { value: 'cold', label: 'Холодные тона' },
  { value: 'unsure', label: 'Не задумывалась' },
];

const analyzingSteps = [
  'Сопоставляем с 12 сезонами...',
  'Сверяем с корейской матрицей...',
  'Определяем архетип Кибби...',
];

export function ColorQuizScreen() {
  const navigate = useNavigate();
  const { save } = useColorAnalysis();
  const [answers, setAnswers] = useState<Partial<ColorQuizAnswers>>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const isComplete =
    answers.skinTone && answers.contrast && answers.hairColor && answers.eyeColor && answers.clothingPref;

  useEffect(() => {
    if (!analyzing) return;
    if (stepIndex >= analyzingSteps.length - 1) {
      const timeout = setTimeout(() => {
        const result = determineColorType(answers as ColorQuizAnswers);
        save(result);
        navigate('/stylist', { replace: true });
      }, 700);
      return () => clearTimeout(timeout);
    }
    const timeout = setTimeout(() => setStepIndex((i) => i + 1), 700);
    return () => clearTimeout(timeout);
  }, [analyzing, stepIndex, answers, save, navigate]);

  const set = <K extends keyof ColorQuizAnswers>(key: K, value: ColorQuizAnswers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  if (analyzing) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
        <div
          className="w-20 h-20 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light), var(--color-blue-light))' }}
        />
        <motion.p
          key={stepIndex}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[15px] font-semibold text-ink"
        >
          {analyzingSteps[stepIndex]}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <h1 className="font-display text-[26px] text-ink mb-1">Определяем твой цветотип</h1>
      <p className="text-[13px] text-olive mb-6">5 коротких вопросов — без фото и загрузок</p>

      <div className="flex flex-col gap-6">
        <section>
          <p className="text-[13px] font-bold text-ink mb-3">Тон кожи</p>
          <div className="flex flex-wrap gap-2">
            {skinToneOptions.map((o) => (
              <OptionPill key={o.value} label={o.label} active={answers.skinTone === o.value} onClick={() => set('skinTone', o.value)} />
            ))}
          </div>
        </section>

        <section>
          <p className="text-[13px] font-bold text-ink mb-3">Контрастность черт</p>
          <div className="flex flex-wrap gap-2">
            {contrastOptions.map((o) => (
              <OptionPill key={o.value} label={o.label} active={answers.contrast === o.value} onClick={() => set('contrast', o.value)} />
            ))}
          </div>
        </section>

        <section>
          <p className="text-[13px] font-bold text-ink mb-3">Естественный цвет волос</p>
          <div className="flex flex-wrap gap-2">
            {hairOptions.map((o) => (
              <OptionPill key={o.value} label={o.value} swatch={o.hex} active={answers.hairColor === o.value} onClick={() => set('hairColor', o.value)} />
            ))}
          </div>
        </section>

        <section>
          <p className="text-[13px] font-bold text-ink mb-3">Цвет глаз</p>
          <div className="flex flex-wrap gap-2">
            {eyeOptions.map((o) => (
              <OptionPill key={o.value} label={o.value} swatch={o.hex} active={answers.eyeColor === o.value} onClick={() => set('eyeColor', o.value)} />
            ))}
          </div>
        </section>

        <section>
          <p className="text-[13px] font-bold text-ink mb-3">Какую одежду чаще носите</p>
          <div className="flex flex-wrap gap-2">
            {clothingOptions.map((o) => (
              <OptionPill key={o.value} label={o.label} active={answers.clothingPref === o.value} onClick={() => set('clothingPref', o.value)} />
            ))}
          </div>
        </section>
      </div>

      <Button
        className="w-full mt-8"
        disabled={!isComplete}
        onClick={() => {
          setStepIndex(0);
          setAnalyzing(true);
        }}
      >
        Определить цветотип
      </Button>
    </div>
  );
}
