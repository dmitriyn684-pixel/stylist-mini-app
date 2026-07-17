import { ProfileIcon } from '../ui/icons';
import { useColorAnalysis } from '../../hooks/useColorAnalysis';
import { useWardrobeStore } from '../../store/useWardrobeStore';
import { computeOutfitMatch } from '../../utils/outfitMatch';
import homeBanner from '../../assets/home-banner.png';

interface HeroStatsProps {
  name: string | null;
  onProfileClick?: () => void;
  onCreateLook?: () => void;
}

export function HeroStats({ name, onProfileClick, onCreateLook }: HeroStatsProps) {
  const { result: colorResult } = useColorAnalysis();
  const items = useWardrobeStore((s) => s.items);
  const outfits = useWardrobeStore((s) => s.outfits);

  const palette = colorResult?.palette ?? null;

  // Реальный % совпадения гардероба с палитрой (та же функция, что и для
  // луков/шопинга) — не выдумываем "98% совпадение" из макета.
  const styleMatch = items.length > 0 ? computeOutfitMatch(items, palette) : null;

  return (
    <section className="home-screen">
      <img src={homeBanner} alt="AI Stylist DimkoFF" className="home-banner" />

      <header className="welcome welcome-compact">
        <button onClick={onProfileClick} className="profile-glow" aria-label={name ? `Профиль — ${name}` : 'Профиль'}>
          <div className="profile-avatar">
            <ProfileIcon className="w-6 h-6" />
          </div>
        </button>
      </header>

      <div className="liquid-card hero-ai hero-ai-compact fade-card">
        <div className="floating-light" />
        <div className="particles">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>

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
    </section>
  );
}
