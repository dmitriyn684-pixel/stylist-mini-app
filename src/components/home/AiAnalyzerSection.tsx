import { useRef, useState } from 'react';

const STYLE_TAGS = ['✨ Elegant', '🤍 Minimal', '💎 Luxury'];

export function AiAnalyzerSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setShowResult(false);
    };
    reader.readAsDataURL(file);
  };

  const handleScanClick = () => {
    if (!photo) {
      fileInputRef.current?.click();
      return;
    }
    setIsScanning(true);
    setShowResult(false);
    // Реального AI-анализа фото в проекте нет (бэкенд умеет только текстовый
    // чат) — это визуальное демо, короткая имитация сканирования и заранее
    // заданный пример результата, честно помеченный как демо.
    setTimeout(() => {
      setIsScanning(false);
      setShowResult(true);
    }, 1800);
  };

  return (
    <section className="analyzer-section">
      <div className="section-title">
        <div>
          <h2>AI Анализ</h2>
          <p>Твой персональный стилист</p>
        </div>
      </div>

      <div className="ai-scanner-card">
        <div
          className="scan-frame"
          style={
            photo
              ? { backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : undefined
          }
        >
          <div className="scan-line" />

          {!photo && (
            <>
              <div className="upload-icon">📸</div>
              <h3>Загрузить образ</h3>
              <p>AI определит стиль, цвета и идеальные сочетания</p>
            </>
          )}

          <button
            type="button"
            className="scan-button"
            style={photo ? { marginTop: 'auto', marginBottom: 20 } : undefined}
            onClick={handleScanClick}
            disabled={isScanning}
          >
            {isScanning ? 'Сканирую…' : photo ? 'Анализировать' : 'Выбрать фото'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {showResult && (
        <div className="analysis-result fade-card">
          <div className="result-header">
            <h3>Ваш стиль</h3>
            <div className="score">98%</div>
          </div>

          <p className="text-[11px] text-olive -mt-1 mb-1">
            Демо-превью — реальный AI-анализ фото появится позже
          </p>

          <div className="style-tags">
            {STYLE_TAGS.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="recommendations">
            <h4>AI рекомендации</h4>
            <p>Добавьте аксессуары золотого оттенка. Образ станет более премиальным.</p>
          </div>
        </div>
      )}
    </section>
  );
}
