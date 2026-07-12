import { useMemo } from 'react';
import { HeartIcon } from '../ui/icons';
import { AvatarViewer } from '../avatar/AvatarViewer';
import { wildberriesSearchUrl, lamodaSearchUrl } from '../../utils/marketplaceLinks';
import { zoneByCategory } from '../../utils/mannequinZones';
import { lookItems, lookTotalPrice } from '../../utils/capsuleData';
import type { CapsuleLook } from '../../types/capsule';
import type { BodyMeasurements } from '../../types/avatar';
import type { MannequinHighlight } from '../avatar/ParametricMannequin';

interface LookCardProps {
  look: CapsuleLook;
  measurements: BodyMeasurements | null;
  saved: boolean;
  onToggleSave: () => void;
}

export function LookCard({ look, measurements, saved, onToggleSave }: LookCardProps) {
  const items = useMemo(() => lookItems(look), [look]);
  const total = useMemo(() => lookTotalPrice(look), [look]);

  const highlights = useMemo<MannequinHighlight[]>(() => {
    const result: MannequinHighlight[] = [];
    for (const item of items) {
      const zone = zoneByCategory[item.category];
      if (zone) result.push({ zone, color: item.color });
    }
    return result;
  }, [items]);

  return (
    <div className="shrink-0 w-[280px] bg-card rounded-2xl shadow-card overflow-hidden">
      {measurements ? (
        <div className="h-[220px]">
          <AvatarViewer measurements={measurements} highlights={highlights} />
        </div>
      ) : (
        <div className="h-[80px] flex items-center justify-center gap-1.5 bg-cream-dark">
          {items.map((i) => (
            <span key={i.id} className="w-6 h-6 rounded-full border border-ink/10" style={{ background: i.color }} />
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-[15px] font-bold text-ink">{look.name}</p>
          <button onClick={onToggleSave} className="shrink-0">
            <HeartIcon className={`w-5 h-5 ${saved ? 'text-pink' : 'text-olive'}`} filled={saved} />
          </button>
        </div>
        <p className="text-[12px] text-olive mb-3">
          {items.length} вещ{items.length === 1 ? 'ь' : items.length < 5 ? 'и' : 'ей'} · от {total.toLocaleString('ru-RU')} ₽
        </p>

        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border border-ink/10 shrink-0" style={{ background: item.color }} />
              <span className="text-[11px] text-ink-soft flex-1 truncate">{item.name}</span>
              <span className="text-[11px] font-semibold text-ink shrink-0">{item.price.toLocaleString('ru-RU')} ₽</span>
              <a
                href={wildberriesSearchUrl(item.name)}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-white bg-[#7000FF] rounded px-1.5 py-0.5 shrink-0"
              >
                WB
              </a>
              <a
                href={lamodaSearchUrl(item.name)}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-white bg-[#0A0A0A] rounded px-1.5 py-0.5 shrink-0"
              >
                Lamoda
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
