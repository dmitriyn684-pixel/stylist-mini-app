import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { MoreIcon, PuzzleIcon, HangerIcon } from '../components/ui/icons';
import { useWardrobeStore } from '../store/useWardrobeStore';
import type { WardrobeCategory } from '../types/wardrobe';
import wardrobeBanner from '../assets/wardrobe-banner.png';

const filters: ('Все' | WardrobeCategory)[] = ['Все', 'Верх', 'Низ', 'Платья', 'Обувь', 'Аксессуары'];

export function WardrobeScreen() {
  const navigate = useNavigate();
  const items = useWardrobeStore((s) => s.items);
  const [active, setActive] = useState<(typeof filters)[number]>('Все');

  const visible = active === 'Все' ? items : items.filter((i) => i.category === active);

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+150px)]">
      <img src={wardrobeBanner} alt="Гардероб" className="page-banner" />

      <div className="flex items-center justify-between px-2 mb-4">
        <h1 className="font-display text-[26px] text-ink">Гардероб</h1>
        <button onClick={() => navigate('/wardrobe/outfits')} className="text-[13px] font-semibold text-lavender flex items-center gap-1">
          <PuzzleIcon className="w-4 h-4" /> Мои луки →
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto px-2 mb-4 -mx-2">
        {filters.map((f) => (
          <Chip key={f} label={f} active={f === active} onClick={() => setActive(f)} />
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-3 py-16 px-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
          >
            <HangerIcon className="w-7 h-7 text-white" />
          </div>
          <p className="text-[13px] text-olive">
            {items.length === 0 ? 'Гардероб пока пуст — добавь первую вещь' : 'В этой категории пока пусто'}
          </p>
        </div>
      ) : (
        <div className="columns-2 gap-3 px-2 [&>*]:mb-3">
          {visible.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/wardrobe/item/${item.id}`)}
              className="relative rounded-2xl overflow-hidden border border-ink/10 block w-full break-inside-avoid"
            >
              <img src={item.imageUrl} alt={item.category} className="w-full h-auto block" />
              <span className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/70 backdrop-blur flex items-center justify-center text-ink">
                <MoreIcon className="w-4 h-4" />
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="fixed left-0 right-0 bottom-[calc(env(safe-area-inset-bottom)+112px)] px-6 max-w-md mx-auto">
        <Button className="w-full shadow-soft" onClick={() => navigate('/wardrobe/add')}>
          + Добавить вещь
        </Button>
      </div>
    </div>
  );
}
