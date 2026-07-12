import type { ChatProfile } from '../types/chat';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

interface StreamChatParams {
  messages: { role: 'user' | 'assistant'; content: string }[];
  profile: ChatProfile;
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (message: string) => void;
  signal?: AbortSignal;
}

/**
 * Ручной парсинг SSE от нашего сервера (тот, в свою очередь, прозрачно
 * прокидывает поток от DeepSeek — формат OpenAI-совместимый: "data: {...}\n\n",
 * завершается "data: [DONE]").
 */
export async function streamChat({ messages, profile, onChunk, onDone, onError, signal }: StreamChatParams) {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, profile }),
      signal,
    });
  } catch {
    onError('Не удалось подключиться к серверу чата. Проверь, что сервер запущен (npm run dev в server/).');
    return;
  }

  if (!res.ok || !res.body) {
    let message = `Сервер вернул ошибку ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      // тело не JSON — оставляем дефолтное сообщение
    }
    onError(message);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split('\n\n');
      buffer = parts.pop() ?? '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data:')) continue;
        const dataStr = line.slice(5).trim();
        if (dataStr === '[DONE]') {
          onDone();
          return;
        }
        try {
          const json = JSON.parse(dataStr);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) onChunk(delta);
        } catch {
          // неполный/некорректный JSON-чанк — пропускаем
        }
      }
    }
  } catch (e) {
    if ((e as Error)?.name !== 'AbortError') {
      onError('Соединение со стилистом прервалось.');
      return;
    }
  }
  onDone();
}
