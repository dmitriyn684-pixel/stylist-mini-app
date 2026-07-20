import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { streamChat } from '../services/chatService';
import { usePremiumStore } from './usePremiumStore';
import type { ChatMessage, ChatProfile } from '../types/chat';
import type { AIStylistId } from '../data/aiStylists';

const FREE_LIMIT = 10;

const genId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const today = () => new Date().toISOString().slice(0, 10);

interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  usageDate: string;
  usageCount: number;
  isUnlimited: boolean;
  setUnlimited: (value: boolean) => void;
  remaining: () => number;
  sendMessage: (text: string, profile: ChatProfile, stylistId: AIStylistId) => Promise<void>;
  addPaletteMessage: (palette: ChatMessage['palette']) => void;
  addNote: (text: string) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,
      usageDate: today(),
      usageCount: 0,
      // Не персистится (см. partialize ниже) — источник правды на бэкенде
      // (ADMIN_TELEGRAM_ID), заново запрашивается при каждом старте приложения
      // через useAdminChatAccess, чтобы не остаться с устаревшим true в
      // localStorage, если админский ID когда-нибудь поменяют.
      isUnlimited: false,
      setUnlimited: (value) => set({ isUnlimited: value }),

      remaining: () => {
        if (usePremiumStore.getState().isPremium || get().isUnlimited) return Infinity;
        const s = get();
        if (s.usageDate !== today()) return FREE_LIMIT;
        return Math.max(0, FREE_LIMIT - s.usageCount);
      },

      sendMessage: async (text, profile, stylistId) => {
        if (get().usageDate !== today()) {
          set({ usageDate: today(), usageCount: 0 });
        }
        if (get().remaining() <= 0 || get().isTyping) return;

        const userMsg: ChatMessage = { id: genId(), role: 'user', content: text };
        const assistantId = genId();
        const assistantMsg: ChatMessage = { id: assistantId, role: 'assistant', content: '', streaming: true };

        const historyForRequest = [...get().messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

        set((s) => ({
          messages: [...s.messages, userMsg, assistantMsg],
          isTyping: true,
          usageCount: s.usageCount + 1,
        }));

        await streamChat({
          messages: historyForRequest,
          profile,
          stylistId,
          onChunk: (chunk) => {
            set((s) => ({
              messages: s.messages.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
            }));
          },
          onDone: () => {
            set((s) => ({
              isTyping: false,
              messages: s.messages.map((m) => (m.id === assistantId ? { ...m, streaming: false } : m)),
            }));
          },
          onError: (message) => {
            set((s) => ({
              isTyping: false,
              messages: s.messages.map((m) =>
                m.id === assistantId ? { ...m, content: message, streaming: false, error: true } : m
              ),
            }));
          },
        });
      },

      addPaletteMessage: (palette) => {
        if (!palette) return;
        set((s) => ({
          messages: [...s.messages, { id: genId(), role: 'assistant', content: '', kind: 'palette', palette }],
        }));
      },

      addNote: (text) => {
        set((s) => ({
          messages: [...s.messages, { id: genId(), role: 'assistant', content: text, kind: 'note' }],
        }));
      },

      clear: () => set({ messages: [] }),
    }),
    {
      name: 'stylist_chat',
      partialize: (s) => ({ messages: s.messages, usageDate: s.usageDate, usageCount: s.usageCount }),
    }
  )
);
