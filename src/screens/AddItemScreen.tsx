import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CameraIcon, ImageIcon } from '../components/ui/icons';
import { loadImageFromFile, resizeToCanvas, canvasToDataUrl } from '../utils/imageUtils';
import { extractDominantColor } from '../utils/colorExtractor';
import { guessCategory } from '../services/categoryClassifier';
import { useWardrobeStore } from '../store/useWardrobeStore';
import type { Season, WardrobeCategory } from '../types/wardrobe';

const categories: WardrobeCategory[] = ['Верх', 'Низ', 'Платья', 'Обувь', 'Аксессуары'];
const seasons: Season[] = ['Весна', 'Лето', 'Осень', 'Зима'];

type Step = 'upload' | 'analyzing' | 'form';

export function AddItemScreen() {
  const navigate = useNavigate();
  const addItem = useWardrobeStore((s) => s.addItem);

  const [step, setStep] = useState<Step>('upload');
  const [statusText, setStatusText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<WardrobeCategory>('Верх');
  const [categoryConfidence, setCategoryConfidence] = useState<number | null>(null);
  const [color, setColor] = useState('#C9BFAE');
  const [season, setSeason] = useState<Season[]>([]);
  const [fabric, setFabric] = useState('');
  const [brand, setBrand] = useState('');
  const [error, setError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setStep('analyzing');
    setError(null);
    try {
      setStatusText('Определяем категорию...');
      const image = await loadImageFromFile(file);
      const canvas = resizeToCanvas(image, 480);
      setImageUrl(canvasToDataUrl(canvas));

      const guess = await guessCategory(canvas);
      if (guess.category) {
        setCategory(guess.category);
        setCategoryConfidence(guess.confidence);
      } else {
        setCategoryConfidence(null);
      }

      setStatusText('Определяем цвет...');
      const dominantColor = extractDominantColor(canvas);
      setColor(dominantColor);

      setStatusText('Анализируем состав...');
      await new Promise((r) => setTimeout(r, 500));

      setStep('form');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не получилось обработать фото');
      setStep('upload');
    }
  };

  const toggleSeason = (s: Season) => {
    setSeason((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSave = () => {
    if (!imageUrl) return;
    addItem({
      imageUrl,
      category,
      categoryConfidence,
      color,
      season,
      fabric,
      brand: brand || undefined,
    });
    navigate('/wardrobe', { replace: true });
  };

  if (step === 'analyzing') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6 px-8 text-center">
        {imageUrl && <img src={imageUrl} alt="" className="w-32 h-32 object-cover rounded-2xl" />}
        <div
          className="w-16 h-16 rounded-full animate-pulse"
          style={{ background: 'linear-gradient(135deg, var(--color-lavender-light), var(--color-pink-light), var(--color-blue-light))' }}
        />
        <p className="text-[15px] font-semibold text-ink">{statusText}</p>
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
        <button onClick={() => navigate('/wardrobe')} className="text-[13px] font-semibold text-olive mb-4">
          ← Назад
        </button>
        {imageUrl && <img src={imageUrl} alt="" className="w-full h-48 object-cover rounded-2xl mb-5" />}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[13px] font-bold text-ink block mb-2">
              Категория {categoryConfidence !== null && <span className="text-[11px] font-normal text-lavender">AI: {categoryConfidence}%</span>}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WardrobeCategory)}
              className="w-full text-[15px] font-semibold text-ink bg-card rounded-xl px-4 py-2.5 outline-none border border-ink/10"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[13px] font-bold text-ink block mb-2">Цвет</label>
            <div className="flex items-center gap-3 bg-card rounded-xl px-4 py-2.5 border border-ink/10">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-full border-0 cursor-pointer" />
              <span className="text-[14px] font-mono text-ink-soft">{color}</span>
            </div>
          </div>

          <div>
            <label className="text-[13px] font-bold text-ink block mb-2">Сезон</label>
            <div className="flex flex-wrap gap-2">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSeason(s)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold border ${
                    season.includes(s) ? 'bg-ink text-cream border-ink' : 'bg-card text-ink-soft border-ink/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[13px] font-bold text-ink block mb-2">Состав ткани</label>
            <input
              type="text"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="Хлопок 100%"
              className="w-full text-[14px] text-ink bg-card rounded-xl px-4 py-2.5 outline-none border border-ink/10"
            />
          </div>

          <div>
            <label className="text-[13px] font-bold text-ink block mb-2">Бренд (опционально)</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Zara"
              className="w-full text-[14px] text-ink bg-card rounded-xl px-4 py-2.5 outline-none border border-ink/10"
            />
          </div>
        </div>

        <Button className="w-full mt-8" onClick={handleSave}>
          Сохранить в гардероб
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+32px)]">
      <button onClick={() => navigate('/wardrobe')} className="text-[13px] font-semibold text-olive mb-4">
        ← Назад
      </button>
      <h1 className="font-display text-[26px] text-ink mb-1">Добавить вещь</h1>
      <p className="text-[13px] text-olive mb-8">Категорию и цвет определим автоматически</p>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="w-full flex items-center gap-4 bg-card rounded-2xl shadow-card p-5 text-left"
        >
          <CameraIcon className="w-7 h-7 text-lavender" />
          <span className="text-[14px] font-bold text-ink">Сфоткать вещь</span>
        </button>
        <button
          onClick={() => galleryInputRef.current?.click()}
          className="w-full flex items-center gap-4 bg-card rounded-2xl shadow-card p-5 text-left"
        >
          <ImageIcon className="w-7 h-7 text-lavender" />
          <span className="text-[14px] font-bold text-ink">Загрузить из галереи</span>
        </button>
      </div>

      {error && <p className="text-[13px] text-error font-semibold mt-4">{error}</p>}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
