import { NavLink } from 'react-router-dom';
import { HomeIcon, WardrobeIcon, StylistIcon, ShoppingIcon, ProfileIcon, ChatIcon } from './icons';

const tabs = [
  { to: '/', label: 'Главная', Icon: HomeIcon, end: true },
  { to: '/wardrobe', label: 'Гардероб', Icon: WardrobeIcon, end: false },
  { to: '/stylist', label: 'Стилист', Icon: StylistIcon, end: false },
  { to: '/shopping', label: 'Шопинг', Icon: ShoppingIcon, end: false },
  { to: '/profile', label: 'Профиль', Icon: ProfileIcon, end: false },
];

export function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink/5 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md flex items-stretch justify-around px-2">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2.5 flex-1 text-[10px] font-semibold transition-colors ${
                isActive ? 'text-lavender' : 'text-olive'
              }`
            }
          >
            <Icon className="w-6 h-6" />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function ChatFab() {
  return (
    <NavLink
      to="/chat"
      aria-label="Чат со стилистом"
      className="fixed left-1/2 -translate-x-1/2 bottom-[46px] z-50 w-14 h-14 rounded-full shimmer-bg text-white flex items-center justify-center shadow-soft active:scale-95 transition-transform"
    >
      <ChatIcon className="w-6 h-6" />
    </NavLink>
  );
}
