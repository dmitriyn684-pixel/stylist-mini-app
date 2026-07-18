import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CameraIcon, ImageIcon, SparkleIcon } from '../components/ui/icons';
import { loadImageFromFile, resizeToCanvas, canvasToDataUrl } from '../utils/imageUtils';
import { extractDominantColor } from '../utils/colorExtractor';
import { guessCategory } from '../services/categoryClassifier';
import { useWardrobeStore } from '../store/useWardrobeStore';
import type { Season, WardrobeCategory } from '../types/wardrobe';

const categories: WardrobeCategory[] = ['Верх', 'Низ', 'Платья', 'Обувь', 'Аксессуары'];
const seasons: Season[] = ['Весна', 'Лето', 'Осень', 'Зима'];

type Step = 'upload' | 'analyzing' | 'form';

// Честный UX уверенности AI: вместо голого "AI: N%" рядом с заголовком
// показываем понятный статус поля. AI не должен выдавать ткань и бренд как
// факт, если они не распознаны по бирке/OCR/ручному вводу — для них
// confidence всегда undefined, пока пользователь не введёт значение сам.
type AnalysisFieldStatus = 'confirmed' | 'review' | 'manual';

function getFieldStatus(confidence?: number | null): AnalysisFieldStatus {
  if (confidence === null || confidence === undefined) return 'manual';
  if (confidence >= 80) return 'confirmed';
  if (confidence >= 40) return 'review';
  return 'manual';
}

const STATUS_STYLE: Record<AnalysisFieldStatus | 'info', string> = {
  confirmed: 'bg-blue-light text-ink-soft',
  review: 'bg-champagne-light text-ink-soft',
  manual: 'bg-[rgba(232,96,125,0.12)] text-ink-soft',
  info: 'bg-olive-light text-ink-soft',
};

function StatusBadge({ tone, children }: { tone: AnalysisFieldStatus | 'info'; children: string }) {
  return (
    <span className={`additem-badge text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[tone]}`}>
      {children}
    </span>
  );
}

export function AddItemScreen() {
  const navigate = useNavigate();
  const addItem = useWardrobeStore((s) => s.addItem);

  const [step, setStep] = useState<Step>('upload');
  const [statusText, setStatusText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<WardrobeCategory>('Верх');
  const [categoryConfidence, setCategoryConfidence] = useState<number | null>(null);
  const [color, setColor] = useState('#C9BFAE');
  const [colorConfidence, setColorConfidence] = useState<number | null>(null);
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
      const colorGuess = extractDominantColor(canvas);
      setColor(colorGuess.hex);
      setColorConfidence(colorGuess.confidence);

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

  // Честная сводка: только category/цвет реально анализирует AI, поэтому
  // только они попадают в "уверенно определено". Состав ткани AI никогда не
  // распознаёт (нет OCR бирки) — пока поле пустое, оно всегда в списке "проверить".
  // Бренд туда не попадает — он опционален и не должен выглядеть недоделанным.
  const categoryStatus = getFieldStatus(categoryConfidence);
  const colorStatus = getFieldStatus(colorConfidence);
  const fabricFilled = fabric.trim().length > 0;

  const confirmedFields: string[] = [];
  const reviewFields: string[] = [];
  if (categoryStatus === 'confirmed') confirmedFields.push('категория');
  else reviewFields.push('категория');
  if (colorStatus === 'confirmed') confirmedFields.push('цвет');
  else reviewFields.push('цвет');
  if (!fabricFilled) reviewFields.push('состав ткани');

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const analysisSummary = [
    confirmedFields.length ? `Уверенно определено: ${capitalize(confirmedFields.join(', '))}.` : null,
    reviewFields.length ? `Проверьте вручную: ${capitalize(reviewFields.join(', '))}.` : null,
  ]
    .filter(Boolean)
    .join(' ');

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
        {imageUrl && (
          <div className="additem-photo-card mb-5">
            <img src={imageUrl} alt="" className="additem-photo-image" />
          </div>
        )}

        {analysisSummary && (
          <div className="additem-ai-card mb-5">
            <div className="additem-ai-card-icon">
              <SparkleIcon />
            </div>
            <div>
              <p className="text-[12px] font-bold text-ink mb-1">AI-анализ</p>
              <p className="text-[13px] text-ink-soft leading-relaxed">{analysisSummary}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-ink">Категория</label>
              <StatusBadge tone={categoryStatus}>
                {categoryStatus === 'confirmed' ? 'AI уверен' : categoryStatus === 'review' ? 'Проверь' : 'Нужно уточнить'}
              </StatusBadge>
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as WardrobeCategory)}
              className="additem-field w-full text-[15px] font-semibold text-ink rounded-xl px-4 py-2.5"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-ink">Цвет</label>
              <StatusBadge tone={colorStatus}>
                {colorStatus === 'confirmed' ? 'Определено AI' : colorStatus === 'review' ? 'Проверь оттенок' : 'Уточните оттенок'}
              </StatusBadge>
            </div>
            <div className="additem-field flex items-center gap-3 rounded-xl px-4 py-2.5">
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8 rounded-full border-0 cursor-pointer" />
              <span className="text-[14px] font-mono text-ink-soft">{color}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-ink">Сезон</label>
              <StatusBadge tone="info">Можно выбрать несколько</StatusBadge>
            </div>
            <div className="flex flex-wrap gap-2">
              {seasons.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSeason(s)}
                  className={`rounded-full px-4 py-2 text-[13px] font-semibold ${
                    season.includes(s) ? 'bg-ink text-cream border border-ink' : 'additem-field text-ink-soft'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-ink">Состав ткани</label>
              {!fabricFilled && <StatusBadge tone="manual">Нужно уточнить</StatusBadge>}
            </div>
            <input
              type="text"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="Уточните состав ткани"
              className="additem-field w-full text-[14px] text-ink rounded-xl px-4 py-2.5"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[13px] font-bold text-ink">Бренд</label>
              {!brand.trim() && <StatusBadge tone="info">Опционально</StatusBadge>}
            </div>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Укажите бренд, если знаете"
              className="additem-field w-full text-[14px] text-ink rounded-xl px-4 py-2.5"
            />
          </div>
        </div>

        <Button className="additem-save-btn w-full mt-8" onClick={handleSave}>
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
