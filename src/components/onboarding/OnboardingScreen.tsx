import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { Button } from '../ui/Button';
import slide1 from '../../assets/onboarding/slide-1.jpg';
import slide2 from '../../assets/onboarding/slide-2.jpg';
import slide3 from '../../assets/onboarding/slide-3.jpg';
import slide4 from '../../assets/onboarding/slide-4.jpg';

interface OnboardingScreenProps {
  onFinish: () => void;
}

const slides = [
  {
    image: slide1,
    title: 'Узнай свой цветотип',
    subtitle: 'По 12-сезонной системе + корейской методике',
  },
  {
    image: slide2,
    title: 'Получи капсульный гардероб',
    subtitle: 'Лучшие бренды Instagram — в одной капсуле',
    caption: 'Избранные магазины из твоей ленты. Не масс-маркет',
  },
  {
    image: slide3,
    title: 'Примеряй на свою 3D-фигуру',
    subtitle: '3 фото = твой цифровой двойник. Одежда сидит идеально.',
  },
  {
    image: slide4,
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
    <div className="relative h-full overflow-hidden bg-ink">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
          {/* Тёмный градиент снизу — фото остаётся ярким сверху, текст читаем снизу
              без сплошной плашки поверх всей карточки. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(20,15,12,.1) 0%, rgba(20,15,12,.05) 30%, rgba(20,15,12,.55) 68%, rgba(20,15,12,.88) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative h-full flex flex-col px-6 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <div className="flex justify-end">
          {!isLast && (
            <button
              onClick={onFinish}
              className="text-[13px] font-semibold text-white px-3 py-1.5 rounded-full bg-black/25 backdrop-blur-sm"
            >
              Пропустить
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-auto cursor-grab active:cursor-grabbing"
          >
            <h1 className="font-display text-[36px] leading-[1.08] tracking-tight text-white mb-3 drop-shadow-sm">
              {slide.title}
            </h1>
            <p className="text-[15px] text-white/90 leading-relaxed max-w-[300px]">{slide.subtitle}</p>
            {slide.caption && <p className="text-[12px] text-white/65 mt-2 max-w-[300px]">{slide.caption}</p>}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2 mt-8 mb-6">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-[6px] rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-[6px] bg-white/40'}`}
            />
          ))}
        </div>

        <Button variant="secondary" onClick={goNext} className="w-full">
          {isLast ? 'Создать аватар' : 'Далее'}
        </Button>
      </div>
    </div>
  );
}
