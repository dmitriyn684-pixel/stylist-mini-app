import { NavLink } from 'react-router-dom';
import type { ComponentType } from 'react';
import { HomeIcon, WardrobeIcon, StylistIcon, ShoppingIcon, ProfileIcon, ChatIcon } from './icons';

interface Tab {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
  end: boolean;
}

// AI-кнопка (переход в чат со стилистом) стоит по центру флекс-ряда — это
// тот же самый переход, что раньше делал отдельный плавающий ChatFab,
// просто теперь встроен в общий стеклянный бар, как в макете Части 7.
const leftTabs: Tab[] = [
  { to: '/', label: 'Главная', Icon: HomeIcon, end: true },
  { to: '/wardrobe', label: 'Гардероб', Icon: WardrobeIcon, end: false },
];

const rightTabs: Tab[] = [
  { to: '/stylist', label: 'AI Стилист', Icon: StylistIcon, end: false },
  { to: '/shopping', label: 'Шопинг', Icon: ShoppingIcon, end: false },
  { to: '/profile', label: 'Профиль', Icon: ProfileIcon, end: false },
];

function TabLink({ to, label, Icon, end }: Tab) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
      <span className="nav-icon">
        <Icon className="w-[22px] h-[22px]" />
      </span>
      <span>{label}</span>
    </NavLink>
  );
}

export function TabBar() {
  return (
    <nav className="bottom-nav">
      {leftTabs.map((t) => (
        <TabLink key={t.to} {...t} />
      ))}

      <NavLink to="/chat" className="nav-item ai-nav" aria-label="AI-стилист">
        <span className="nav-icon">
          <ChatIcon className="w-6 h-6" />
        </span>
      </NavLink>

      {rightTabs.map((t) => (
        <TabLink key={t.to} {...t} />
      ))}
    </nav>
  );
}
