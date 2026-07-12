import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Button } from '../ui/Button';
import { PaletteIcon, HangerIcon, ProfileIcon, SparkleIcon } from '../ui/icons';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    Icon: PaletteIcon,
    title: 'Узнай свой цветотип',
    subtitle: 'По 12-сезонной системе + корейской методике',
  },
  {
    Icon: HangerIcon,
    title: 'Получи капсульный гардероб',
    subtitle: 'Со ссылками на Wildberries и Lamoda',
  },
  {
    Icon: ProfileIcon,
    title: 'Примеряй на свою 3D-фигуру',
    subtitle: '3 фото = твой цифровой двойник. Одежда сидит идеально.',
  },
  {
    Icon: SparkleIcon,
    title: 'Готова?',
    subtitle: 'Начнём с определения твоего стиля',
  },
];

export function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const isLast = index === slides.length - 1;

  const goToAvatarCreation = () => {
    onFinish();
    navigate('/avatar/create', { replace: true });
  };
  const goNext = () => (isLast ? goToAvatarCreation() : setIndex((i) => i + 1));
  const goPrev = () => setIndex((i) => Math.max(0, i - 1));

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60) goNext();
    else if (info.offset.x > 60) goPrev();
  };

  const slide = slides[index];

  return (
    <div className="h-full flex flex-col bg-cream px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <div className="flex justify-end">
        {!isLast && (
          <button onClick={onFinish} className="text-[13px] font-semibold text-olive px-2 py-2">
            Пропустить
          </button>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.28 }}
            className="w-full flex flex-col items-center text-center gap-6 cursor-grab active:cursor-grabbing"
          >
            <div
              className="w-40 h-40 rounded-full flex items-center justify-center"
              style={{
                background:
                  'radial-gradient(circle at 30% 30%, var(--color-lavender-light), var(--color-pink-light) 55%, var(--color-blue-light) 100%)',
              }}
            >
              <slide.Icon className="w-16 h-16 text-white" />
            </div>
            <div>
              <h1 className="font-display text-[30px] leading-tight text-ink mb-3">{slide.title}</h1>
              <p className="text-[15px] text-ink-soft leading-relaxed max-w-[280px]">{slide.subtitle}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-2 mb-8">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`h-[6px] rounded-full transition-all ${i === index ? 'w-6 bg-lavender' : 'w-[6px] bg-olive-light'}`}
          />
        ))}
      </div>

      <Button onClick={goNext} className="w-full">
        {isLast ? 'Создать аватар' : 'Далее'}
      </Button>
    </div>
  );
}
