import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CheckIcon } from '../components/ui/icons';
import { AvatarViewer } from '../components/avatar/AvatarViewer';
import { useWardrobeStore } from '../store/useWardrobeStore';
import { useAvatarStore } from '../store/useAvatarStore';
import type { MannequinHighlight } from '../components/avatar/ParametricMannequin';
import { zoneByCategory } from '../utils/mannequinZones';

export function OutfitCreatorScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const items = useWardrobeStore((s) => s.items);
  const addOutfit = useWardrobeStore((s) => s.addOutfit);
  const measurements = useAvatarStore((s) => s.measurements);

  const preselected = params.get('itemId');
  const [selected, setSelected] = useState<string[]>(preselected ? [preselected] : []);
  const [name, setName] = useState('');

  const toggle = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const highlights = useMemo<MannequinHighlight[]>(() => {
    const result: MannequinHighlight[] = [];
    for (const id of selected) {
      const item = items.find((i) => i.id === id);
      const zone = item && zoneByCategory[item.category];
      if (item && zone) result.push({ zone, color: item.color });
    }
    return result;
  }, [selected, items]);

  const handleSave = () => {
    if (selected.length === 0) return;
    addOutfit({ name: name.trim() || 'Новый лук', itemIds: selected });
    navigate('/wardrobe/outfits', { replace: true });
  };

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <button onClick={() => navigate('/wardrobe/outfits')} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>
      <h1 className="font-display text-[24px] text-ink mb-4">Создать лук</h1>

      {measurements ? (
        <>
          <AvatarViewer measurements={measurements} highlights={highlights} />
          <p className="text-center text-[11px] text-olive mt-2 mb-5">← свайп для вращения →</p>
        </>
      ) : (
        <p className="text-[12px] text-olive text-center mb-5">Создай 3D-аватар, чтобы видеть превью лука</p>
      )}

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название лука, например «На встречу»"
        className="w-full text-[14px] text-ink bg-card rounded-xl px-4 py-2.5 outline-none border border-ink/10 mb-5"
      />

      <p className="text-[13px] font-bold text-ink mb-3">Выбери вещи из гардероба</p>
      {items.length === 0 ? (
        <p className="text-[13px] text-olive mb-5">В гардеробе пока нет вещей</p>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-6">
          {items.map((item) => {
            const isSelected = selected.includes(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggle(item.id)}
                className="relative rounded-xl overflow-hidden aspect-square"
                style={{ outline: isSelected ? '3px solid var(--color-lavender)' : 'none', outlineOffset: '-3px' }}
              >
                <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
                {isSelected && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-lavender text-white flex items-center justify-center">
                    <CheckIcon className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button onClick={handleSave} disabled={selected.length === 0}>
          Сохранить лук
        </Button>
        <Button variant="secondary" onClick={() => navigate('/chat')}>
          Спросить совет AI
        </Button>
      </div>
    </div>
  );
}
