import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ChartIcon, SparkleIcon, HangerIcon, PuzzleIcon, TrashIcon } from '../components/ui/icons';
import { useWardrobeStore } from '../store/useWardrobeStore';
import { useAvatarStore } from '../store/useAvatarStore';
import { fabricCareTip } from '../utils/fabricCare';

function formatDate(iso: string | null): string {
  if (!iso) return 'ещё не надевали';
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date(iso));
}

export function ItemDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const item = useWardrobeStore((s) => s.items.find((i) => i.id === id));
  const deleteItem = useWardrobeStore((s) => s.deleteItem);
  const markWorn = useWardrobeStore((s) => s.markWorn);
  const hasAvatar = useAvatarStore((s) => Boolean(s.measurements));

  if (!item) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-8 gap-4">
        <p className="text-[14px] text-olive">Вещь не найдена</p>
        <Button onClick={() => navigate('/wardrobe')}>К гардеробу</Button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <button onClick={() => navigate('/wardrobe')} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>

      <img src={item.imageUrl} alt={item.category} className="w-full h-64 object-cover rounded-2xl mb-5" />

      <div className="bg-card rounded-2xl shadow-card p-5 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-[13px] text-ink-soft">Категория</span>
          <span className="text-[13px] font-semibold text-ink">{item.category}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-[13px] text-ink-soft">Цвет</span>
          <span className="text-[13px] font-semibold text-ink flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-ink/10 inline-block" style={{ background: item.color }} />
            {item.color}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-[13px] text-ink-soft">Сезон</span>
          <span className="text-[13px] font-semibold text-ink">{item.season.length ? item.season.join(', ') : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[13px] text-ink-soft">Состав</span>
          <span className="text-[13px] font-semibold text-ink">{item.fabric || '—'}</span>
        </div>
        {item.brand && (
          <div className="flex justify-between mt-2">
            <span className="text-[13px] text-ink-soft">Бренд</span>
            <span className="text-[13px] font-semibold text-ink">{item.brand}</span>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl shadow-card p-5 mb-4">
        <p className="text-[13px] font-bold text-ink mb-3 flex items-center gap-1.5">
          <ChartIcon className="w-4 h-4 text-lavender" /> Статистика
        </p>
        <div className="flex justify-between mb-2">
          <span className="text-[13px] text-ink-soft">Надета</span>
          <span className="text-[13px] font-semibold text-ink">{item.timesWorn} раз</span>
        </div>
        <div className="flex justify-between mb-3">
          <span className="text-[13px] text-ink-soft">Последний раз</span>
          <span className="text-[13px] font-semibold text-ink">{formatDate(item.lastWornAt)}</span>
        </div>
        <Button variant="secondary" onClick={() => markWorn(item.id)} className="w-full !py-2.5 !text-[13px]">
          Отметить, что надела сегодня
        </Button>
      </div>

      <div className="bg-card rounded-2xl shadow-card p-5 mb-4">
        <p className="text-[13px] font-bold text-ink mb-2 flex items-center gap-1.5">
          <SparkleIcon className="w-4 h-4 text-lavender" /> Уход за тканью
        </p>
        <p className="text-[13px] text-ink-soft leading-relaxed">{fabricCareTip(item.fabric)}</p>
      </div>

      <div className="flex flex-col gap-3">
        {hasAvatar ? (
          <Button variant="secondary" onClick={() => navigate(`/avatar/tryon/${item.id}`)}>
            <HangerIcon className="w-4 h-4" /> Примерь на себя
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => navigate('/avatar/create')}>
            Создать аватар, чтобы примерить
          </Button>
        )}
        <Button variant="secondary" onClick={() => navigate(`/wardrobe/outfits/create?itemId=${item.id}`)}>
          <PuzzleIcon className="w-4 h-4" /> Создать лук с этой вещью
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            if (confirm('Удалить вещь из гардероба?')) {
              deleteItem(item.id);
              navigate('/wardrobe', { replace: true });
            }
          }}
        >
          <TrashIcon className="w-4 h-4" /> Удалить из гардероба
        </Button>
      </div>
    </div>
  );
}
