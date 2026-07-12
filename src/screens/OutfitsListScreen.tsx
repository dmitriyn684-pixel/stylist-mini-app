import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { PuzzleIcon } from '../components/ui/icons';
import { useWardrobeStore } from '../store/useWardrobeStore';

export function OutfitsListScreen() {
  const navigate = useNavigate();
  const outfits = useWardrobeStore((s) => s.outfits);
  const items = useWardrobeStore((s) => s.items);

  return (
    <div className="px-4 pt-[calc(env(safe-area-inset-top)+16px)] pb-[calc(env(safe-area-inset-bottom)+150px)]">
      <h1 className="font-display text-[26px] text-ink px-2 mb-5">Мои луки</h1>

      {outfits.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-3 py-16 px-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light))' }}
          >
            <PuzzleIcon className="w-7 h-7 text-white" />
          </div>
          <p className="text-[13px] text-olive">Пока нет ни одного лука</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-2">
          {outfits.map((outfit) => {
            const outfitItems = outfit.itemIds.map((id) => items.find((i) => i.id === id)).filter(Boolean);
            return (
              <button
                key={outfit.id}
                onClick={() => navigate(`/wardrobe/outfits/${outfit.id}`)}
                className="bg-card rounded-2xl shadow-card overflow-hidden text-left"
              >
                <div className="grid grid-cols-2 aspect-square">
                  {outfitItems.slice(0, 4).map((item) => (
                    <img key={item!.id} src={item!.imageUrl} alt="" className="w-full h-full object-cover" />
                  ))}
                  {outfitItems.length === 0 && <div className="col-span-2 row-span-2 bg-cream-dark" />}
                </div>
                <div className="p-3">
                  <p className="text-[13px] font-bold text-ink truncate">{outfit.name}</p>
                  <p className="text-[11px] text-olive">{outfit.itemIds.length} вещ{outfit.itemIds.length === 1 ? 'ь' : 'ей'}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="fixed left-0 right-0 bottom-[86px] px-6 max-w-md mx-auto">
        <Button className="w-full shadow-soft" onClick={() => navigate('/wardrobe/outfits/create')}>
          + Создать лук
        </Button>
      </div>
    </div>
  );
}
