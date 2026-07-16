import { useRef, useState } from 'react';
import { ColorGrid } from '../ui/ColorGrid';
import { loadImageFromFile, resizeToCanvas, canvasToDataUrl } from '../../utils/imageUtils';
import { scanPhoto, type PhotoScanResult } from '../../services/photoAnalysisService';
import { useColorAnalysis } from '../../hooks/useColorAnalysis';
import { CameraIcon, PaletteIcon, ContrastIcon, ProfileIcon } from '../ui/icons';

export function AiAnalyzerSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { save } = useColorAnalysis();
  const [photo, setPhoto] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PhotoScanResult | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // чтобы выбор того же файла повторно тоже сработал

    try {
      // Сжимаем на клиенте перед отправкой — полноразмерное фото с телефона
      // (несколько МБ) не нужно гонять на сервер, для анализа цвета лица
      // достаточно 900px по большей стороне.
      const image = await loadImageFromFile(file);
      const canvas = resizeToCanvas(image, 900);
      const dataUrl = canvasToDataUrl(canvas, 0.85);
      setPhoto(dataUrl);
      setResult(null);
      setError(null);
    } catch {
      setError('Не удалось обработать фото — попробуй другое');
    }
  };

  const handleScanClick = async () => {
    if (!photo) {
      fileInputRef.current?.click();
      return;
    }

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      const analysis = await scanPhoto(photo);
      setResult(analysis);
      save(analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось выполнить анализ');
    } finally {
      setIsScanning(false);
    }
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
              <div className="upload-icon">
                <CameraIcon className="w-9 h-9" />
              </div>
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

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        {isScanning && (
          <div className="premium-progress mb-3">
            <div className="premium-fill" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-center text-[13px] text-error px-6 -mt-2 mb-2 fade-card">{error}</p>
      )}

      {isScanning && <div className="skeleton-card mx-5 mb-2" />}

      {result && (
        <div className="analysis-result fade-card">
          <div className="result-header">
            <h3>{result.seasonalType}</h3>
            <div className="score">{result.confidence}%</div>
          </div>

          <div className="style-tags">
            <span>
              <PaletteIcon className="w-3.5 h-3.5" /> {result.skinUndertone}
            </span>
            <span>
              <ContrastIcon className="w-3.5 h-3.5" /> {result.contrastLevel} контраст
            </span>
            <span>
              <ProfileIcon className="w-3.5 h-3.5" /> {result.kibbeType}
            </span>
          </div>

          <div className="recommendations">
            <h4>AI рекомендации</h4>
            <p>{result.description}</p>
          </div>

          <p className="text-[12px] font-bold text-ink mt-5 mb-2">Твоя палитра</p>
          <ColorGrid swatches={result.palette.base} />
        </div>
      )}
    </section>
  );
}
