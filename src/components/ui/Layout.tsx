import { Outlet } from 'react-router-dom';
import { TabBar, ChatFab } from './TabBar';

export function Layout() {
  return (
    <div className="min-h-full bg-cream">
      <Outlet />
      <ChatFab />
      <TabBar />
    </div>
  );
}
