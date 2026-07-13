import { useEffect, useMemo } from 'react';
import type { TelegramWebApp, TelegramUser } from '../types/telegram.d.ts';
import type { ColorAnalysisResult } from '../types/analysis';

const mockUser: TelegramUser = { id: 0, first_name: 'Аня' };

const API_BASE = import.meta.env.VITE_API_URL ?? '';

// Тот же ключ, что читает useColorAnalysis() — так экраны результата
// подхватывают разбор из бота без доработок.
const COLOR_ANALYSIS_KEY = 'color_analysis_result';
const PROFILE_KEY = 'stylist_profile';

// Диспатчим после записи в localStorage, чтобы хуки-читатели (useColorAnalysis,
// useUserProfile) могли обновиться реактивно — они читают localStorage один раз
// при монтировании через useState(() => ...), а не подписаны на изменения.
// Без этого события экраны, смонтированные ДО того как фетч отработал (обычный
// случай — фетч асинхронный, а Home/Profile рендерятся сразу), навсегда
// остаются со значением на момент монтирования, даже когда данные уже пришли.
export const PROFILE_SYNCED_EVENT = 'stylist:profile-synced';

interface BridgedColorAnalysis {
  seasonalType?: string;
  koreanSubtype?: string;
  kibbeType?: string;
  description?: string;
  palette?: { base?: unknown[]; accent?: unknown[]; anchor?: unknown[]; avoid?: unknown[] };
}

interface BridgedProfile {
  name?: string;
  gender?: string;
  age?: string;
  height?: string;
  weight?: string;
  budget?: string;
  lifestyle?: unknown;
  colorAnalysis?: BridgedColorAnalysis | null;
}

/**
 * Подтягивает анкету + результат анализа, сохранённые ботом на backend
 * (см. server/src/index.ts, POST /api/user/save-profile), и кладёт их
 * в localStorage — туда же, откуда их читают существующие экраны.
 * Ничего не делает вне Telegram и если backend недоступен/профиля ещё нет.
 */
function useBridgeProfileFromBot(userId: number | undefined) {
  useEffect(() => {
    // TODO: временный лог для диагностики — подтвердить, что реальный
    // Telegram user id доходит до фетча (не 0/undefined). Убрать после проверки.
    console.log('[bridge] Telegram userId для фетча профиля:', userId);
    if (!userId) return;

    fetch(`${API_BASE}/api/user/profile/${userId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { user?: BridgedProfile } | null) => {
        const user = data?.user;
        if (!user) return;

        const { colorAnalysis, ...profile } = user;
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

        if (colorAnalysis?.seasonalType || colorAnalysis?.kibbeType) {
          const result: ColorAnalysisResult = {
            seasonalType: colorAnalysis.seasonalType ?? '',
            koreanSubtype: colorAnalysis.koreanSubtype ?? '',
            kibbeType: colorAnalysis.kibbeType ?? '',
            description: colorAnalysis.description ?? '',
            palette: {
              base: (colorAnalysis.palette?.base ?? []) as ColorAnalysisResult['palette']['base'],
              accent: (colorAnalysis.palette?.accent ?? []) as ColorAnalysisResult['palette']['accent'],
              avoid: (colorAnalysis.palette?.avoid ?? []) as ColorAnalysisResult['palette']['avoid'],
            },
          };
          localStorage.setItem(COLOR_ANALYSIS_KEY, JSON.stringify(result));
        }

        window.dispatchEvent(new Event(PROFILE_SYNCED_EVENT));
      })
      .catch(() => {
        // backend недоступен или профиля ещё нет — просто работаем с тем,
        // что уже есть в localStorage
      });
  }, [userId]);
}

/**
 * Обёртка над Telegram WebApp SDK. Вне Telegram (обычный браузер, локальная
 * разработка) отдаёт безопасные заглушки, чтобы верстать и превьюить без клиента.
 */
export function useTelegram() {
  const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;

  useEffect(() => {
    webApp?.ready();
    webApp?.expand();
  }, [webApp]);

  const user = useMemo<TelegramUser>(() => webApp?.initDataUnsafe?.user ?? mockUser, [webApp]);

  useBridgeProfileFromBot(webApp ? user.id : undefined);

  const haptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    webApp?.HapticFeedback?.impactOccurred(style);
  };

  return {
    webApp: webApp as TelegramWebApp | undefined,
    isTelegram: Boolean(webApp),
    user,
    haptic,
  };
}
