import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CameraIcon, ImageIcon, SparkleIcon } from '../components/ui/icons';
import { loadImageFromFile, resizeToCanvas, canvasToDataUrl } from '../utils/imageUtils';
import { extractDominantColor } from '../utils/colorExtractor';
import { guessCategory } from '../services/categoryClassifier';
import { useWardrobeStore } from '../store/useWardrobeStore';
import type { Season, WardrobeCategory } from '../types/wardrobe';
import styles from './AddItemScreen.module.css';

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
  confirmed: styles.badgeConfirmed,
  review: styles.badgeReview,
  manual: styles.badgeManual,
  info: styles.badgeInfo,
};

function StatusBadge({ tone, children }: { tone: AnalysisFieldStatus | 'info'; children: string }) {
  return <span className={`${styles.badge} ${STATUS_STYLE[tone]}`}>{children}</span>;
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
      <main className={`${styles.page} ${styles.analysisPage}`} aria-live="polite">
        <div className={styles.analysisPanel}>
          {imageUrl && <img src={imageUrl} alt="Добавляемая вещь" className={styles.analysisPreview} />}
          <div className={styles.analysisMark} aria-hidden="true">
            <SparkleIcon />
          </div>
          <p className={styles.eyebrow}>AI wardrobe analysis</p>
          <h1>Изучаем вещь</h1>
          <p className={styles.analysisStatus}>{statusText}</p>
          <div className={styles.progressTrack} aria-hidden="true">
            <span />
          </div>
        </div>
      </main>
    );
  }

  if (step === 'form') {
    return (
      <main className={styles.page}>
        <header className={styles.compactHeader}>
          <button type="button" onClick={() => navigate('/wardrobe')} className={styles.backButton}>
            <span aria-hidden="true">←</span> Назад
          </button>
          <span className={styles.headerLabel}>Подтверждение вещи</span>
        </header>

        {imageUrl && (
          <figure className={styles.productCard}>
            <img src={imageUrl} alt="Добавляемая вещь" />
            <figcaption>
              <span>Wardrobe edit</span>
              <b>Новая вещь</b>
            </figcaption>
          </figure>
        )}

        {analysisSummary && (
          <section className={styles.aiCard} aria-labelledby="ai-analysis-title">
            <div className={styles.aiCardIcon} aria-hidden="true">
              <SparkleIcon />
            </div>
            <div>
              <p className={styles.eyebrow}>AI assisted</p>
              <h2 id="ai-analysis-title">AI-анализ</h2>
              <p>{analysisSummary}</p>
            </div>
          </section>
        )}

        <section className={styles.formCard} aria-label="Параметры вещи">
          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="item-category">Категория</label>
              <StatusBadge tone={categoryStatus}>
                {categoryStatus === 'confirmed' ? 'AI уверен' : categoryStatus === 'review' ? 'Проверь' : 'Нужно уточнить'}
              </StatusBadge>
            </div>
            <select
              id="item-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as WardrobeCategory)}
              className={styles.control}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="item-color">Цвет</label>
              <StatusBadge tone={colorStatus}>
                {colorStatus === 'confirmed' ? 'Определено AI' : colorStatus === 'review' ? 'Проверь оттенок' : 'Уточните оттенок'}
              </StatusBadge>
            </div>
            <div className={`${styles.control} ${styles.colorControl}`}>
              <input id="item-color" type="color" value={color} onChange={(e) => setColor(e.target.value)} />
              <span>{color}</span>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <span className={styles.fieldLabel}>Сезон</span>
              <StatusBadge tone="info">Можно выбрать несколько</StatusBadge>
            </div>
            <div className={styles.seasonGrid}>
              {seasons.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSeason(s)}
                  className={`${styles.seasonChip} ${season.includes(s) ? styles.seasonChipActive : ''}`}
                  aria-pressed={season.includes(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="item-fabric">Состав ткани</label>
              {!fabricFilled && <StatusBadge tone="manual">Нужно уточнить</StatusBadge>}
            </div>
            <input
              id="item-fabric"
              type="text"
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              placeholder="Уточните состав ткани"
              className={styles.control}
            />
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="item-brand">Бренд</label>
              {!brand.trim() && <StatusBadge tone="info">Опционально</StatusBadge>}
            </div>
            <input
              id="item-brand"
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Укажите бренд, если знаете"
              className={styles.control}
            />
          </div>
        </section>

        <Button className={styles.saveButton} onClick={handleSave}>
          Сохранить в гардероб
        </Button>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <header className={styles.uploadHeader}>
        <button type="button" onClick={() => navigate('/wardrobe')} className={styles.backButton}>
          <span aria-hidden="true">←</span> Назад
        </button>
        <p className={styles.eyebrow}>Wardrobe curation</p>
        <h1>Добавить вещь</h1>
        <p>Сфотографируй вещь целиком — AI предложит категорию и основной оттенок.</p>
      </header>

      <section className={styles.uploadCard} aria-label="Выбор фотографии">
        <div className={styles.uploadMonogram} aria-hidden="true">
          <SparkleIcon />
        </div>
        <div className={styles.uploadCardCopy}>
          <span>New wardrobe piece</span>
          <b>Нейтральный фон даст более точный результат</b>
        </div>

        <div className={styles.uploadActions}>
          <button type="button" onClick={() => cameraInputRef.current?.click()} className={styles.cameraAction}>
            <CameraIcon />
            <span>
              <b>Сфотографировать</b>
              <small>Открыть камеру</small>
            </span>
          </button>
          <button type="button" onClick={() => galleryInputRef.current?.click()} className={styles.galleryAction}>
            <ImageIcon />
            <span>
              <b>Выбрать из галереи</b>
              <small>Загрузить готовое фото</small>
            </span>
          </button>
        </div>
      </section>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.fileInput}
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
        className={styles.fileInput}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </main>
  );
}
