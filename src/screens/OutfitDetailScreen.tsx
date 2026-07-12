import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { TrashIcon } from '../components/ui/icons';
import { AvatarViewer } from '../components/avatar/AvatarViewer';
import { useWardrobeStore } from '../store/useWardrobeStore';
import { useAvatarStore } from '../store/useAvatarStore';
import type { MannequinHighlight } from '../components/avatar/ParametricMannequin';
import { zoneByCategory } from '../utils/mannequinZones';

export function OutfitDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const outfit = useWardrobeStore((s) => s.outfits.find((o) => o.id === id));
  const items = useWardrobeStore((s) => s.items);
  const deleteOutfit = useWardrobeStore((s) => s.deleteOutfit);
  const measurements = useAvatarStore((s) => s.measurements);

  const outfitItems = useMemo(
    () => (outfit ? outfit.itemIds.map((iid) => items.find((i) => i.id === iid)).filter(Boolean) : []),
    [outfit, items]
  );

  const highlights = useMemo<MannequinHighlight[]>(() => {
    const result: MannequinHighlight[] = [];
    for (const item of outfitItems) {
      const zone = item && zoneByCategory[item.category];
      if (item && zone) result.push({ zone, color: item.color });
    }
    return result;
  }, [outfitItems]);

  if (!outfit) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-8 gap-4">
        <p className="text-[14px] text-olive">Лук не найден</p>
        <Button onClick={() => navigate('/wardrobe/outfits')}>К лукам</Button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <button onClick={() => navigate('/wardrobe/outfits')} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>
      <h1 className="font-display text-[24px] text-ink mb-4">{outfit.name}</h1>

      {measurements && (
        <>
          <AvatarViewer measurements={measurements} highlights={highlights} />
          <p className="text-center text-[11px] text-olive mt-2 mb-5">← свайп для вращения →</p>
        </>
      )}

      <p className="text-[13px] font-bold text-ink mb-3">Вещи в луке</p>
      <div className="grid grid-cols-3 gap-2 mb-6">
        {outfitItems.map((item) => (
          <button
            key={item!.id}
            onClick={() => navigate(`/wardrobe/item/${item!.id}`)}
            className="rounded-xl overflow-hidden aspect-square"
          >
            <img src={item!.imageUrl} alt={item!.category} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      <Button
        variant="ghost"
        onClick={() => {
          if (confirm('Удалить лук?')) {
            deleteOutfit(outfit.id);
            navigate('/wardrobe/outfits', { replace: true });
          }
        }}
      >
        <TrashIcon className="w-4 h-4" /> Удалить лук
      </Button>
    </div>
  );
}
