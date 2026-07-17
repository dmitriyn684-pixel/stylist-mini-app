import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

export function Layout() {
  return (
    <div className="min-h-full bg-transparent">
      <Outlet />
      <TabBar />
    </div>
  );
}
