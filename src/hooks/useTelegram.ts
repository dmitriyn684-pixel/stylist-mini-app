import { useEffect, useMemo } from 'react';
import type { TelegramWebApp, TelegramUser } from '../types/telegram.d.ts';

const mockUser: TelegramUser = { id: 0, first_name: 'Аня' };

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
