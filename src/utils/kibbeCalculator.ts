import type { BodyMeasurements, KibbeResult, KibbeType } from '../types/avatar';

const YIN_YANG: Record<KibbeType, string> = {
  Dramatic: 'Ян ярко выражен',
  'Soft Dramatic': 'Ян с мягкой фактурой',
  'Flamboyant Natural': 'Ян, крупный костяк',
  Natural: 'Ян, спокойная линия',
  'Soft Natural': 'Ян с заметным Инь',
  'Dramatic Classic': 'Баланс со сдвигом в Ян',
  Classic: 'Идеальный баланс',
  'Soft Classic': 'Баланс со сдвигом в Инь',
  'Flamboyant Gamine': 'Контраст Ян+Инь, компакт',
  Gamine: 'Баланс, компакт',
  'Soft Gamine': 'Компакт со сдвигом в Инь',
  'Theatrical Romantic': 'Инь с долей Ян',
  Romantic: 'Инь ярко выражен',
};

const DESCRIPTIONS: Record<KibbeType, string> = {
  Dramatic: 'Длинные прямые линии и острый выразительный костяк — тело создано для строгих силуэтов и монохрома.',
  'Soft Dramatic': 'Тот же длинный драматичный каркас, но с мягкими тканями и плавными изгибами.',
  'Flamboyant Natural': 'Широкий крупный костяк и рост дают простор для объёмных, расслабленных силуэтов.',
  Natural: 'Прямые, неброские линии и крепкий костяк — комфорт и функциональность важнее строгости.',
  'Soft Natural': 'Крепкий костяк смягчён округлыми формами — сочетание расслабленности и женственности.',
  'Dramatic Classic': 'Сбалансированные пропорции с чуть более вытянутыми линиями — строгая элегантность.',
  Classic: 'Пропорции идеально сбалансированы — идут почти любые силуэты в умеренных линиях.',
  'Soft Classic': 'Та же сбалансированность, но с мягкостью и лёгкой округлостью линий.',
  'Flamboyant Gamine': 'Компактная фигура с резким контрастом широких и узких зон — любит смелые контрасты.',
  Gamine: 'Сбалансированная компактная фигура — и чёткие, и мягкие линии смотрятся органично.',
  'Soft Gamine': 'Компактная фигура с мягкостью — сочетание чёткости и женственной округлости.',
  'Theatrical Romantic': 'Выраженные изгибы с драматичным акцентом — женственность с эффектной подачей.',
  Romantic: 'Ярко выраженные плавные изгибы — тело создано для мягких, женственных силуэтов.',
};

const RECOMMENDATIONS: Record<KibbeType, string[]> = {
  Dramatic: ['Прямые силуэты без сборок', 'Монохромные образы и чёткие линии', 'Крупные простые аксессуары'],
  'Soft Dramatic': ['Струящиеся ткани в прямом силуэте', 'Глубокие декольте и разрезы', 'Гладкие текстуры без рюш'],
  'Flamboyant Natural': ['Оверсайз и многослойность', 'Фактурные ткани (твид, замша)', 'Крупные простые формы без мелких деталей'],
  Natural: ['Расслабленный крой, не облегающий', 'Натуральные фактуры (лён, хлопок)', 'Минимум декора'],
  'Soft Natural': ['Мягкий расслабленный крой с намёком на талию', 'Трикотаж и струящиеся ткани', 'Один акцент на женственность за раз'],
  'Dramatic Classic': ['Чёткий крой без лишнего декора', 'Длинные жакеты и прямые юбки', 'Сдержанные, дорогие ткани'],
  Classic: ['Классический крой без крайностей', 'Качественные базовые ткани', 'Аккуратные, не массивные аксессуары'],
  'Soft Classic': ['Классика с мягкими деталями (драпировка, атлас)', 'Плавные линии кроя', 'Один женственный акцент'],
  'Flamboyant Gamine': ['Контрастные сочетания (крупное+мелкое)', 'Яркие акценты и графичный крой', 'Смешение фактур в одном образе'],
  Gamine: ['Микс строгого и игривого в одном луке', 'Укороченные силуэты', 'Контрастные, но небольшие детали'],
  'Soft Gamine': ['Милые детали в чётком крое', 'Небольшие принты', 'Талия подчёркнута, но силуэт не облегающий'],
  'Theatrical Romantic': ['Облегающий силуэт с эффектной деталью', 'Глубокий вырез или разрез', 'Насыщенные цвета, богатая фактура'],
  Romantic: ['Облегающий или полуприлегающий силуэт', 'Мягкие, лёгкие ткани (шёлк, шифон)', 'Округлые детали: рюши, драпировка'],
};

function getYinYangBalance(type: KibbeType): string {
  return YIN_YANG[type];
}

function getKibbeDescription(type: KibbeType): string {
  return DESCRIPTIONS[type];
}

function getKibbeRecommendations(type: KibbeType): string[] {
  return RECOMMENDATIONS[type];
}

/**
 * Определение архетипа Кибби по реальным меркам. Это упрощённая эвристика на
 * пяти соотношениях (рост, талия/бёдра, плечи/бёдра, ноги/рост, грудь/плечи),
 * а не полная 13-архетипная методика Кибби (та строится на визуальной оценке
 * костяка и "фактуры" в паре с профессиональным консультантом). confidence —
 * условная метрика "насколько чётко пропорции попали в одну из веток", не
 * калиброванная статистическая вероятность.
 */
export function calculateKibbe(measurements: BodyMeasurements): KibbeResult {
  const { height, shoulderWidth, bustCircumference, waistCircumference, hipCircumference, inseam } = measurements;

  const heightModifier = height < 160 ? 'petite' : height > 172 ? 'tall' : 'moderate';

  const whr = waistCircumference / hipCircumference;
  const verticalLine = whr < 0.7 ? 'curved' : whr > 0.8 ? 'straight' : 'moderate';

  const shoulderHipRatio = shoulderWidth / (hipCircumference / Math.PI);
  const boneStructure = shoulderHipRatio > 1.1 ? 'yang_dominant' : shoulderHipRatio < 0.9 ? 'yin_dominant' : 'balanced';

  const legRatio = inseam / height;
  const legLine = legRatio > 0.48 ? 'long' : legRatio < 0.44 ? 'short' : 'moderate';

  const bustToShoulder = bustCircumference / shoulderWidth;
  const fleshType = bustToShoulder > 3.0 ? 'soft' : bustToShoulder < 2.5 ? 'taut' : 'moderate';

  let type: KibbeType;
  let confidence: number;

  // Порядок веток важен: petite (Gamine-семья) проверяем первой, иначе общая
  // проверка boneStructure==='yang_dominant' перехватывает случай раньше и
  // 'Flamboyant Gamine' никогда не будет достигнута (это и ловит TS через
  // сужение типов — в исходном псевдокоде из ТЗ эта ветка была мёртвым кодом).
  if (heightModifier === 'petite') {
    if (boneStructure === 'yang_dominant') {
      type = 'Flamboyant Gamine';
      confidence = 77;
    } else if (fleshType === 'soft' && verticalLine === 'curved') {
      type = 'Theatrical Romantic';
      confidence = 82;
    } else if (fleshType === 'soft') {
      type = 'Soft Gamine';
      confidence = 77;
    } else if (boneStructure === 'balanced' && verticalLine === 'moderate') {
      type = 'Gamine';
      confidence = 77;
    } else {
      type = 'Gamine';
      confidence = 65;
    }
  } else if (heightModifier === 'tall' && verticalLine === 'straight') {
    type = fleshType === 'soft' ? 'Soft Dramatic' : 'Dramatic';
    confidence = 85;
  } else if (boneStructure === 'yang_dominant') {
    if (heightModifier === 'tall' && fleshType === 'soft') {
      type = 'Flamboyant Natural';
      confidence = 80;
    } else if (fleshType === 'soft') {
      type = 'Soft Natural';
      confidence = 80;
    } else {
      type = 'Natural';
      confidence = 80;
    }
  } else if (verticalLine === 'curved' && fleshType === 'soft') {
    type = 'Romantic';
    confidence = 82;
  } else if (boneStructure === 'balanced' && verticalLine === 'moderate' && fleshType === 'moderate') {
    if (legLine === 'long') {
      type = 'Dramatic Classic';
      confidence = 78;
    } else if (legLine === 'short') {
      type = 'Soft Classic';
      confidence = 78;
    } else {
      type = 'Classic';
      confidence = 80;
    }
  } else {
    type = 'Classic';
    confidence = 60;
  }

  return {
    type,
    confidence,
    yinYangBalance: getYinYangBalance(type),
    description: getKibbeDescription(type),
    recommendations: getKibbeRecommendations(type),
  };
}
