import { useEffect, useState } from 'react';
import { PROFILE_SYNCED_EVENT } from './useTelegram';

const KEY = 'stylist_profile';

export interface UserProfile {
  name?: string;
  gender?: string;
  age?: string;
  height?: string;
  weight?: string;
  budget?: string;
  lifestyle?: string[];
}

function readFromStorage(): UserProfile | null {
  const raw = localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as UserProfile) : null;
}

/**
 * Реальная анкета, пришедшая из бота через мост (см. useTelegram.ts).
 * null, пока пользователь не прошёл анкету в боте ни разу — экраны должны
 * сами решать, что показать в этом случае (explicit empty-state), а не
 * подставлять demo-имя вроде "Аня".
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(readFromStorage);

  useEffect(() => {
    const onSynced = () => setProfile(readFromStorage());
    window.addEventListener(PROFILE_SYNCED_EVENT, onSynced);
    return () => window.removeEventListener(PROFILE_SYNCED_EVENT, onSynced);
  }, []);

  return { profile, hasProfile: profile !== null };
}
