import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PremiumState {
  isPremium: boolean;
  setPremium: (value: boolean) => void;
}

/**
 * Реальной оплаты нет (для этого нужен свой Telegram-бот с sendInvoice,
 * которого у stylist-app пока нет). Это тестовый тумблер — включает Premium
 * локально, чтобы можно было проверить, что безлимит в чате реально работает.
 */
export const usePremiumStore = create<PremiumState>()(
  persist(
    (set) => ({
      isPremium: false,
      setPremium: (value) => set({ isPremium: value }),
    }),
    { name: 'stylist_premium' }
  )
);
