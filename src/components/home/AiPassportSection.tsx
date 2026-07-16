import { useNavigate } from 'react-router-dom';
import { useTelegram } from '../../hooks/useTelegram';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useColorAnalysis } from '../../hooks/useColorAnalysis';
import { useAvatarStore } from '../../store/useAvatarStore';
import { useWardrobeStore } from '../../store/useWardrobeStore';
import { usePremiumStore } from '../../store/usePremiumStore';

export function AiPassportSection() {
  const navigate = useNavigate();
  const { user } = useTelegram();
  const { profile } = useUserProfile();
  const { result: colorResult } = useColorAnalysis();
  const kibbeResult = useAvatarStore((s) => s.kibbeResult);
  const items = useWardrobeStore((s) => s.items);
  const outfits = useWardrobeStore((s) => s.outfits);
  const isPremium = usePremiumStore((s) => s.isPremium);

  const name = profile?.name || user.first_name || 'Гость';
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
      <div className="passport-card liquid depth">
        <span className="glow-pink" />
        <span className="glow-blue" />
        <div className="profile-top">
          <div className="premium-ring">
            <div className="big-avatar">✦</div>
          </div>
          <div>
            <h2>{name}</h2>
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
              <div className="style-icon">✨</div>
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
          <li>✨ Неограниченный AI стилист</li>
          <li>👗 Создание образов каждый день</li>
          <li>💎 Анализ всего гардероба</li>
          <li>🛍 Умный шопинг</li>
        </ul>
        <button type="button" onClick={() => navigate('/premium')}>
          {isPremium ? 'Управлять подпиской' : 'Активировать Premium'}
        </button>
      </div>
    </section>
  );
}
