import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/utils/cn';

export function MobileNavigation({ navItems = [] }) {
  if (!navItems.length) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-brand-card border-t-3 border-brand-orange shadow-brand-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end !== undefined ? item.end : true}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center flex-1 py-1 px-1 transition-colors font-nunito',
                  isActive
                    ? 'text-brand-darkGreen font-black'
                    : 'text-brand-darkGreen/60 hover:text-brand-darkGreen font-bold'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-1 rounded-brand-sm transition-all',
                      isActive ? 'bg-brand-yellow border-2 border-brand-orange text-brand-darkGreen' : ''
                    )}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>
                  <span className="text-[10px] mt-0.5 truncate max-w-[64px]">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
