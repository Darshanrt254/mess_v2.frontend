import React, { useState } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { MobileNavigation } from './MobileNavigation';
import { cn } from '@/utils/cn';

export function AppShell({
  children,
  role = 'OWNER',
  navItems = [],
  mobileNavItems,
  sidebarTitle,
  containerClassName = 'max-w-7xl',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-creamLight flex flex-col font-nunito selection:bg-brand-yellow selection:text-brand-darkGreen">
      {/* Topbar */}
      <Topbar
        role={role}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex w-full">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          navItems={navItems}
          title={sidebarTitle || (role === 'OWNER' ? 'Owner Portal' : 'Customer Portal')}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-20 md:pb-10">
          <div className={cn('mx-auto p-4 sm:p-6 lg:p-8', containerClassName)}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      {mobileNavItems && mobileNavItems.length > 0 && (
        <MobileNavigation navItems={mobileNavItems} />
      )}
    </div>
  );
}
