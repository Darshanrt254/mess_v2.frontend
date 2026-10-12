import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, LogOut, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/hooks/useAuth';

export function Topbar({ onToggleSidebar, role = 'OWNER' }) {
  const { user, logout } = useAuth();
  const dashboardHref = role === 'OWNER' ? '/owner/dashboard' : '/customer/dashboard';

  return (
    <header className="sticky top-0 z-30 bg-brand-darkGreen text-brand-cream border-b-3 border-brand-orange shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-brand-sm text-brand-yellow hover:bg-white/10 md:hidden transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <Link
            to={dashboardHref}
            className="flex items-center gap-2 select-none group cursor-pointer"
            title="Go to Dashboard"
          >
            <div className="w-9 h-9 rounded-brand-sm bg-brand-yellow flex items-center justify-center border-2 border-brand-orange text-brand-darkGreen shadow-sm group-hover:scale-105 transition-transform">
              <Utensils className="w-5 h-5 font-black" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-brand-yellow block leading-none group-hover:text-amber-300 transition-colors">
                SWAYAMSIDDHA
              </span>
              <span className="text-[10px] font-extrabold tracking-widest text-brand-greenPale block uppercase">
                Tiffin Management
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Role badge, User info, Logout */}
        <div className="flex items-center gap-3">
          <Badge
            variant={role === 'OWNER' ? 'brand' : 'success'}
            size="sm"
            className="hidden sm:inline-flex"
          >
            {role}
          </Badge>

          <div className="flex items-center gap-2 pl-2 border-l border-brand-green">
            <Avatar
              name={user?.name || (role === 'OWNER' ? 'Owner Admin' : 'Customer')}
              size="sm"
            />
            <div className="hidden md:block text-left">
              <span className="text-xs font-black text-white block leading-tight truncate max-w-[130px]">
                {user?.name || (role === 'OWNER' ? 'Owner Admin' : 'Swayam Customer')}
              </span>
              <span className="text-[10px] font-bold text-brand-greenPale block truncate">
                {user?.phone || user?.email || (role === 'OWNER' ? 'admin@swayamsiddha.in' : '9876543210')}
              </span>
            </div>

            <button
              onClick={logout}
              title="Sign out"
              className="ml-1 p-2 rounded-brand-sm text-brand-cream/80 hover:text-white hover:bg-red-900/40 transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
