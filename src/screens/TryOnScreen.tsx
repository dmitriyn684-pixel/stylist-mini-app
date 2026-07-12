import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { AvatarViewer } from '../components/avatar/AvatarViewer';
import { useWardrobeStore } from '../store/useWardrobeStore';
import { useAvatarStore } from '../store/useAvatarStore';
import { zoneByCategory } from '../utils/mannequinZones';

export function TryOnScreen() {
  const { itemId } = useParams<{ itemId: string }>();
  const navigate = useNavigate();
  const item = useWardrobeStore((s) => s.items.find((i) => i.id === itemId));
  const measurements = useAvatarStore((s) => s.measurements);

  if (!item || !measurements) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-8 gap-4">
        <p className="text-[14px] text-olive">{!item ? 'Вещь не найдена' : 'Сначала создай 3D-аватар'}</p>
        <Button onClick={() => navigate(item ? '/avatar/create' : '/wardrobe')}>
          {item ? 'Создать аватар' : 'К гардеробу'}
        </Button>
      </div>
    );
  }

  const zone = zoneByCategory[item.category];

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <button onClick={() => navigate(`/wardrobe/item/${item.id}`)} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>
      <h1 className="font-display text-[24px] text-ink mb-4">Примерка</h1>

      <AvatarViewer measurements={measurements} highlights={zone ? [{ zone, color: item.color }] : undefined} />

      <p className="text-center text-[11px] text-olive mt-2 mb-5">← свайп для вращения →</p>

      {zone ? (
        <p className="text-[13px] text-ink-soft leading-relaxed text-center">
          Это не полноценная 3D-примерка (та потребует наложения текстуры ткани на аватар — задел под неё уже готов,
          см. структуру ClothingSkin), а быстрая визуальная подсказка: зона аватара подсвечена цветом вещи.
        </p>
      ) : (
        <p className="text-[13px] text-ink-soft leading-relaxed text-center">
          Примерка пока поддерживается только для категорий «Верх», «Низ» и «Платья» — для обуви и аксессуаров
          подходящей зоны на манекене ещё нет.
        </p>
      )}
    </div>
  );
}
