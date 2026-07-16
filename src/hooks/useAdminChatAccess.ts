import { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Снимает дневной лимит сообщений в чате для админа/тестировщика. Источник
 * правды — бэкенд (ADMIN_TELEGRAM_ID в server/.env, см. GET
 * /api/user/:telegramId/is-admin) — фронтенд только запрашивает статус и
 * выставляет флаг в useChatStore. Сам дневной счётчик по-прежнему считается
 * локально (бэкенд квоту не хранит), это меняет только исход remaining().
 */
export function useAdminChatAccess(telegramId: number | undefined) {
  const setUnlimited = useChatStore((s) => s.setUnlimited);

  useEffect(() => {
    if (!telegramId) return;

    let cancelled = false;
    fetch(`${API_BASE}/api/user/${telegramId}/is-admin`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { isAdmin?: boolean } | null) => {
        if (!cancelled && data?.isAdmin) setUnlimited(true);
      })
      .catch(() => {
        // бэкенд недоступен — остаёмся с обычным дневным лимитом
      });

    return () => {
      cancelled = true;
    };
  }, [telegramId, setUnlimited]);
}
