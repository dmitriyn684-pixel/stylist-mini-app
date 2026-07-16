import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SparkleIcon, CheckIcon } from '../components/ui/icons';
import { usePremiumStore } from '../store/usePremiumStore';

const benefits = [
  'Безлимитные сообщения AI-стилисту (сейчас бесплатно 10 в день)',
  'Приоритетный доступ к новым функциям (капсулы, сбор чемодана)',
  'Поддержка разработки приложения',
];

export function PremiumScreen() {
  const navigate = useNavigate();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const setPremium = usePremiumStore((s) => s.setPremium);

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <button onClick={() => navigate(-1)} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>

      <h1 className="font-display text-[28px] text-ink mb-6 flex items-center gap-2">
        <SparkleIcon className="w-6 h-6 text-lavender" /> Stylist AI Premium
      </h1>

      <div className="bg-cream-dark rounded-xl px-4 py-3 mb-6">
        <p className="text-[12px] text-ink-soft leading-relaxed">
          Оплата пока не подключена — в приложении ещё нет своего Telegram-бота, через который проходят платежи
          (Stars/ЮKassa требуют бота с обработкой инвойсов). Кнопка ниже включает Premium локально, только для
          тестирования.
        </p>
      </div>

      <div className="liquid-card p-5 mb-6">
        <p className="text-[13px] font-bold text-ink mb-3">Что даёт Premium</p>
        <div className="flex flex-col gap-2">
          {benefits.map((b) => (
            <p key={b} className="text-[13px] text-ink-soft flex gap-2">
              <span className="text-lavender shrink-0">→</span>
              {b}
            </p>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="liquid-card p-4 text-center">
          <p className="text-[12px] text-olive mb-1">Месяц</p>
          <p className="text-[20px] font-bold text-ink">299 ₽</p>
        </div>
        <div className="liquid-card p-4 text-center">
          <p className="text-[12px] text-pink font-semibold mb-1">Год · выгоднее</p>
          <p className="text-[20px] font-bold text-ink">1990 ₽</p>
        </div>
      </div>

      {isPremium ? (
        <div className="flex flex-col gap-3">
          <p className="text-center text-[14px] font-semibold text-lavender flex items-center justify-center gap-1.5">
            <CheckIcon className="w-4 h-4" /> Premium активен (тестовый режим)
          </p>
          <Button variant="ghost" onClick={() => setPremium(false)}>
            Деактивировать (тест)
          </Button>
        </div>
      ) : (
        <Button className="premium-btn w-full" onClick={() => setPremium(true)}>
          Активировать <span className="opacity-70 font-normal text-[13px]">(тест)</span>
        </Button>
      )}
    </div>
  );
}
