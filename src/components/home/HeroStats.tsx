import { ProfileIcon } from '../ui/icons';
import { useColorAnalysis } from '../../hooks/useColorAnalysis';
import { useAvatarStore } from '../../store/useAvatarStore';
import { useWardrobeStore } from '../../store/useWardrobeStore';
import { computeOutfitMatch } from '../../utils/outfitMatch';

interface HeroStatsProps {
  name: string;
  onProfileClick?: () => void;
  onCreateLook?: () => void;
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Доброй ночи';
  if (h < 12) return 'Доброе утро';
  if (h < 18) return 'Добрый день';
  return 'Добрый вечер';
}

function dayIndex(): number {
  return Math.floor(Date.now() / 86_400_000);
}

function itemsWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'вещей';
  if (mod10 === 1) return 'вещь';
  if (mod10 >= 2 && mod10 <= 4) return 'вещи';
  return 'вещей';
}

export function HeroStats({ name, onProfileClick, onCreateLook }: HeroStatsProps) {
  const { result: colorResult } = useColorAnalysis();
  const kibbeResult = useAvatarStore((s) => s.kibbeResult);
  const items = useWardrobeStore((s) => s.items);
  const outfits = useWardrobeStore((s) => s.outfits);

  const palette = colorResult?.palette ?? null;
  const kibbeType = kibbeResult?.type ?? colorResult?.kibbeType ?? null;

  // Реальный % совпадения гардероба с палитрой (та же функция, что и для
  // луков/шопинга) — не выдумываем "98% совпадение" из макета.
  const styleMatch = items.length > 0 ? computeOutfitMatch(items, palette) : null;

  // "Цвет дня" — реальный оттенок из палитры пользователя, детерминированно
  // ротируется по дню (тот же приём, что и в AiOutfitSection/AiShoppingSection).
  const dayColors = palette ? [...palette.base, ...palette.accent] : [];
  const colorOfDay = dayColors.length > 0 ? dayColors[dayIndex() % dayColors.length] : null;

  const unworn = items.filter((i) => i.timesWorn === 0).length;

  const hasToday = Boolean(colorOfDay || kibbeType || unworn > 0);

  return (
    <section className="home-screen">
      <header className="welcome">
        <div>
          <p>{greeting()}</p>
          <h1>{name}</h1>
        </div>
        <button onClick={onProfileClick} className="profile-glow" aria-label={`Профиль — ${name}`}>
          <div className="profile-avatar">
            <ProfileIcon className="w-6 h-6" />
          </div>
        </button>
      </header>

      <div className="liquid-card hero-ai fade-card">
        <div className="floating-light" />

        <div className="ai-core">
          <div className="core-inner">AI</div>
        </div>

        <h2>Твой AI Stylist</h2>
        <p>Персональные образы, созданные специально для тебя</p>

        <div className="style-score">
          <div>
            <b>{styleMatch !== null ? `${styleMatch}%` : '—'}</b>
            <span>Style Match</span>
          </div>
          <div>
            <b>{outfits.length}</b>
            <span>New Looks</span>
          </div>
          <div>
            <b>{items.length}</b>
            <span>Items</span>
          </div>
        </div>

        <button className="create-look" onClick={onCreateLook}>
          Создать образ
        </button>
      </div>

      {hasToday && (
        <div className="today-card liquid-card fade-card">
          <h3>Сегодня для тебя</h3>

          {colorOfDay && (
            <div className="today-item">
              <div className="gold-dot" style={{ background: colorOfDay.hex }} />
              Цвет дня — {colorOfDay.name}
            </div>
          )}

          {kibbeType && (
            <div className="today-item">
              <div className="pink-dot" />
              Твой стиль — {kibbeType}
            </div>
          )}

          {unworn > 0 && (
            <div className="today-item">
              <div className="lavender-dot" />
              {unworn} {itemsWord(unworn)} {unworn === 1 ? 'ждёт' : 'ждут'} своего образа
            </div>
          )}
        </div>
      )}
    </section>
  );
}
