import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';

export interface LayoutOutletContext {
  setTabBarHidden: (hidden: boolean) => void;
}

export function Layout() {
  const [isTabBarHidden, setTabBarHidden] = useState(false);

  return (
    <div className="min-h-full bg-cream">
      <Outlet context={{ setTabBarHidden }} />
      {!isTabBarHidden && <TabBar />}
    </div>
  );
}
