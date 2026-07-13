import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ProfileIcon, ChartIcon, TrophyIcon, CrownIcon, SearchIcon, PuzzleIcon, SparkleIcon } from '../components/ui/icons';
import { AvatarViewer } from '../components/avatar/AvatarViewer';
import { useAvatarStore } from '../store/useAvatarStore';
import { useColorAnalysis } from '../hooks/useColorAnalysis';
import { useUserProfile } from '../hooks/useUserProfile';
import { useTelegram } from '../hooks/useTelegram';
import { usePremiumStore } from '../store/usePremiumStore';
import { useWardrobeStore } from '../store/useWardrobeStore';

const mockAchievements = [
  { Icon: CrownIcon, label: 'Икона стиля' },
  { Icon: SearchIcon, label: 'Ревизор гардероба' },
  { Icon: PuzzleIcon, label: 'Королева капсул' },
];
const mockCoins = 250;

export function ProfileScreen() {
  const navigate = useNavigate();
  const { measurements, kibbeResult } = useAvatarStore();
  const { result: colorResult } = useColorAnalysis();
  const { profile } = useUserProfile();
  const { user } = useTelegram();
  const isPremium = usePremiumStore((s) => s.isPremium);
  const items = useWardrobeStore((s) => s.items);
  const outfits = useWardrobeStore((s) => s.outfits);

  const name = profile?.name || user.first_name || 'Гость';
  // Челленджей как фичи в приложении пока нет — честный 0, а не выдуманное число.
  const stats = { items: items.length, outfits: outfits.length, challenges: 0 };

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+110px)]">
      {measurements ? (
        <AvatarViewer measurements={measurements} />
      ) : (
        <div className="w-full h-[240px] rounded-2xl flex flex-col items-center justify-center gap-3 text-center px-8 bg-card">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
          >
            <ProfileIcon className="w-6 h-6 text-white" />
          </div>
          <p className="text-[13px] text-olive">3D-аватар ещё не создан</p>
          <Button onClick={() => navigate('/avatar/create')}>Создать аватар</Button>
        </div>
      )}

      <h1 className="font-display text-[26px] text-ink mt-5 mb-1">{name}</h1>
      <p className="text-[13px] text-ink-soft mb-1">
        Цветотип: <span className="font-semibold text-ink">{colorResult?.seasonalType ?? 'не определён'}</span>
      </p>
      <p className="text-[13px] text-ink-soft mb-5">
        Тип фигуры: <span className="font-semibold text-ink">{kibbeResult?.type ?? colorResult?.kibbeType ?? 'не определён'}</span>
      </p>

      <div className="bg-card rounded-2xl shadow-card p-5 mb-4">
        <p className="text-[13px] font-bold text-ink mb-3 flex items-center gap-1.5">
          <ChartIcon className="w-4 h-4 text-lavender" /> Статистика
        </p>
        <div className="flex justify-between">
          <div className="text-center">
            <p className="text-[20px] font-bold text-ink">{stats.items}</p>
            <p className="text-[11px] text-olive">Вещей</p>
          </div>
          <div className="text-center">
            <p className="text-[20px] font-bold text-ink">{stats.outfits}</p>
            <p className="text-[11px] text-olive">Луков</p>
          </div>
          <div className="text-center">
            <p className="text-[20px] font-bold text-ink">{stats.challenges}</p>
            <p className="text-[11px] text-olive">Челленджей</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-5 mb-4">
        <p className="text-[13px] font-bold text-ink mb-3 flex items-center gap-1.5">
          <TrophyIcon className="w-4 h-4 text-lavender" /> Достижения
        </p>
        <div className="flex gap-4">
          {mockAchievements.map((a) => (
            <div key={a.label} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
              >
                <a.Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-[10px] text-olive text-center leading-tight">{a.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-5 mb-4 flex items-center justify-between" style={{ background: 'linear-gradient(120deg, var(--color-pink-light), var(--color-blue-light))' }}>
        <span className="text-[13px] font-bold text-ink">Виртуальная валюта</span>
        <span className="text-[18px] font-bold text-ink">{mockCoins}</span>
      </div>

      <button
        onClick={() => navigate('/premium')}
        className="w-full flex items-center gap-3 rounded-2xl shadow-card p-4 mb-6 text-left"
        style={{ background: isPremium ? 'linear-gradient(120deg, var(--color-lavender-light), var(--color-pink-light))' : 'var(--color-card)' }}
      >
        <SparkleIcon className="w-6 h-6 text-lavender shrink-0" />
        <span className="flex-1">
          <span className="block text-[14px] font-bold text-ink">{isPremium ? 'Premium активен' : 'Оформить Premium'}</span>
          <span className="block text-[12px] text-olive">{isPremium ? 'Безлимитный AI-стилист' : 'Безлимитный чат со стилистом'}</span>
        </span>
        <span className="text-olive">→</span>
      </button>

      <div className="flex flex-col gap-3">
        <Button variant="secondary" onClick={() => navigate('/profile/edit')}>Редактировать профиль</Button>
        <Button variant="secondary" onClick={() => navigate('/avatar/create')}>Обновить 3D-аватар</Button>
        <Button variant="ghost">Настройки уведомлений</Button>
      </div>
    </div>
  );
}
