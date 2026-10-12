import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export function Sidebar({
  navItems = [],
  isOpen = false,
  onClose,
  title = 'Navigation',
  className = '',
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-brand-card border-r-3 border-brand-orange flex flex-col transition-transform duration-200 ease-in-out md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:shrink-0 md:translate-x-0 font-nunito shadow-brand',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b-2 border-brand-orange/30 bg-brand-yellow/30">
          <span className="text-xs font-black uppercase tracking-wider text-brand-darkGreen">
            {title}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-brand-darkGreen hover:bg-brand-orange/20 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end !== undefined ? item.end : true}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-brand-sm text-sm font-extrabold transition-all duration-150',
                    isActive
                      ? 'bg-brand-darkGreen text-brand-yellow border-2 border-brand-orange shadow-brand'
                      : 'text-brand-darkGreen hover:bg-brand-yellow/40 hover:text-brand-darkGreen border-2 border-transparent'
                  )
                }
              >
                {Icon && <Icon className="w-4 h-4 shrink-0" />}
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-brand-orange text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t-2 border-brand-orange/20 bg-brand-yellow/10">
          <div className="text-[11px] font-extrabold text-brand-green">
            Swayamsiddha v2.0
          </div>
          <div className="text-[10px] font-bold text-brand-green/70">
            Frontend UI Foundation
          </div>
        </div>
      </aside>
    </>
  );
}
