import { ProfileIcon } from '../ui/icons';

interface HeroStatsProps {
  name: string;
  totalItems: number;
  totalOutfits: number;
  readyPercent: number;
  onProfileClick?: () => void;
  onOpenStylist?: () => void;
}

export function HeroStats({
  name,
  totalItems,
  totalOutfits,
  readyPercent,
  onProfileClick,
  onOpenStylist,
}: HeroStatsProps) {
  return (
    <>
      <header className="premium-header">
        <div className="brand">
          <div className="brand-name">
            Stylist <span>DimkoFF</span>
          </div>
          <div className="brand-sub">AI Fashion Assistant</div>
        </div>

        <button onClick={onProfileClick} className="profile-glow" aria-label={`Профиль — ${name}`}>
          <div className="profile-avatar">
            <ProfileIcon className="w-6 h-6" />
          </div>
        </button>
      </header>

      <section className="hero-card fade-card">
        <div className="shine" />

        <div className="ai-core" />

        <h1>
          Твой персональный
          <br />
          AI стилист
        </h1>

        <p>Создавай образы, которые подчёркивают твою индивидуальность</p>

        <div className="stats">
          <div>
            <b>{totalItems}</b>
            <span>вещей</span>
          </div>
          <div>
            <b>{totalOutfits}</b>
            <span>образов</span>
          </div>
          <div>
            <b>{readyPercent}%</b>
            <span>стиль</span>
          </div>
        </div>

        <button className="lux-button" onClick={onOpenStylist}>
          Открыть стилиста <span>→</span>
        </button>
      </section>
    </>
  );
}
