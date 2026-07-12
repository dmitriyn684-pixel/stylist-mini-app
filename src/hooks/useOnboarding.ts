import { useCallback, useState } from 'react';

const KEY = 'onboarding_seen';

export function useOnboarding() {
  const [seen, setSeen] = useState(() => localStorage.getItem(KEY) === '1');

  const markSeen = useCallback(() => {
    localStorage.setItem(KEY, '1');
    setSeen(true);
  }, []);

  return { seen, markSeen };
}
