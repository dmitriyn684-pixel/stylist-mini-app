import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useColorAnalysis } from '../../hooks/useColorAnalysis';
import { useAvatarStore } from '../../store/useAvatarStore';
import { useWardrobeStore } from '../../store/useWardrobeStore';
import { usePremiumStore } from '../../store/usePremiumStore';
import { SparkleIcon, HangerIcon, WardrobeIcon, ShoppingIcon } from '../ui/icons';

export function AiPassportSection() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { profile } = useUserProfile();
  const { result: colorResult } = useColorAnalysis();
  const kibbeResult = useAvatarStore((s) => s.kibbeResult);
  const items = useWardrobeStore((s) => s.items);
  const outfits = useWardrobeStore((s) => s.outfits);
  const isPremium = usePremiumStore((s) => s.isPremium);

  // Только имя из анкеты бота — никаких Telegram first_name/заглушек (см. HomeScreen.tsx).
  const name = profile?.name ?? null;
  const styleId = `DIM-${String(user.id || 0).padStart(4, '0').slice(-4)}`;
  const kibbeType = kibbeResult?.type ?? colorResult?.kibbeType ?? null;
  const brandsCount = new Set(items.map((i) => i.brand).filter(Boolean)).size;
  const styleTags = [colorResult?.seasonalType, colorResult?.koreanSubtype].filter(Boolean) as string[];

  // ColorAnalysisResult не объявляет confidence — но photoAnalysisService
  // кладёт его в тот же объект при сохранении скана фото через Gemini.
  // Показываем реальное число только когда оно реально пришло со скана,
  // не выдумываем "98% совпадение" для результата из анкеты бота.
  const confidence = (colorResult as unknown as { confidence?: number } | null)?.confidence;

  return (
    <section className="profile-section">
      <div className="passport-card liquid-card depth">
        <span className="glow-pink" />
        <span className="glow-blue" />
        <div className="profile-top">
          <div className="premium-ring">
            <div className="big-avatar">
              <SparkleIcon className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h2>{name ?? 'Профиль'}</h2>
            <p>AI Fashion Profile</p>
          </div>
        </div>

        <div className="fashion-id">
          <div>
            <span>Style ID</span>
            <b>{styleId}</b>
          </div>
          <div>
            <span>Level</span>
            <b>{isPremium ? 'Premium' : 'Free'}</b>
          </div>
        </div>
      </div>

      <div className="style-card">
        <h3>Твой стиль</h3>
        {kibbeType ? (
          <>
            <div className="style-main">
              <div className="style-icon">
                <SparkleIcon className="w-6 h-6" />
              </div>
              <div>
                <h4>{kibbeType}</h4>
                <p>{confidence != null ? `${confidence}% совпадение` : colorResult?.seasonalType}</p>
              </div>
            </div>
            {styleTags.length > 0 && (
              <div className="style-tags">
                {styleTags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-[13px] text-olive mt-3">
            Пройди анализ в боте или сканер фото выше, чтобы узнать свой стиль
          </p>
        )}
      </div>

      <div className="stats-profile">
        <div>
          <b>{items.length}</b>
          <span>Вещи</span>
        </div>
        <div>
          <b>{outfits.length}</b>
          <span>Луки</span>
        </div>
        <div>
          <b>{brandsCount}</b>
          <span>Бренды</span>
        </div>
      </div>

      <div className="premium-box">
        <h2>AI Stylist PRO</h2>
        <p>{isPremium ? 'Все возможности уже разблокированы' : 'Раскрой свой полный стиль'}</p>
        <ul>
          <li>
            <SparkleIcon className="w-4 h-4" /> Неограниченный AI стилист
          </li>
          <li>
            <HangerIcon className="w-4 h-4" /> Создание образов каждый день
          </li>
          <li>
            <WardrobeIcon className="w-4 h-4" /> Анализ всего гардероба
          </li>
          <li>
            <ShoppingIcon className="w-4 h-4" /> Умный шопинг
          </li>
        </ul>
        <button type="button" onClick={() => navigate('/premium')}>
          {isPremium ? 'Управлять подпиской' : 'Активировать Premium'}
        </button>
      </div>
    </section>
  );
}
