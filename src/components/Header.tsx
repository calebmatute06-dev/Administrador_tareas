import React from 'react';
import { Plus, Bell, Home } from 'lucide-react';

interface HeaderProps {
  activeTab: 'resumen' | 'facturas' | 'tareas' | 'mantenimiento' | 'calendario';
  onSelectTab: (tab: 'resumen' | 'facturas' | 'tareas' | 'mantenimiento' | 'calendario') => void;
  onOpenQuickAction: () => void;
  urgentAlertsCount: number;
  onOpenAlerts: () => void;
  onOpenMembers: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickAction,
  urgentAlertsCount,
  onOpenAlerts,
  onOpenMembers,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectTab('resumen')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-base shadow-xs group-hover:bg-sky-700 transition-colors">
                <Home className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                HogarSync
              </span>
            </button>
          </div>

          {/* Zone 2: 5 clean single-line navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onSelectTab('resumen')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                activeTab === 'resumen'
                  ? 'border-sky-600 text-sky-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Resumen General
            </button>
            <button
              onClick={() => onSelectTab('facturas')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                activeTab === 'facturas'
                  ? 'border-sky-600 text-sky-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Facturas y Pagos
            </button>
            <button
              onClick={() => onSelectTab('tareas')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                activeTab === 'tareas'
                  ? 'border-sky-600 text-sky-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Tareas Domésticas
            </button>
            <button
              onClick={() => onSelectTab('mantenimiento')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                activeTab === 'mantenimiento'
                  ? 'border-sky-600 text-sky-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Mantenimiento
            </button>
            <button
              onClick={() => onSelectTab('calendario')}
              className={`whitespace-nowrap transition-colors py-1 border-b-2 ${
                activeTab === 'calendario'
                  ? 'border-sky-600 text-sky-600 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Calendario
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenMembers}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
            >
              Miembros y Saldos
            </button>

            <button
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Alertas y Recordatorios"
              aria-label="Alertas y Recordatorios"
            >
              <Bell className="w-4 h-4" />
              {urgentAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center font-mono-numbers">
                  {urgentAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenQuickAction}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Registrar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile subnav */}
      <div className="flex md:hidden items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50/80 overflow-x-auto text-xs">
        <button
          onClick={() => onSelectTab('resumen')}
          className={`px-2 py-1 whitespace-nowrap rounded font-medium ${
            activeTab === 'resumen' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          Resumen
        </button>
        <button
          onClick={() => onSelectTab('facturas')}
          className={`px-2 py-1 whitespace-nowrap rounded font-medium ${
            activeTab === 'facturas' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          Facturas
        </button>
        <button
          onClick={() => onSelectTab('tareas')}
          className={`px-2 py-1 whitespace-nowrap rounded font-medium ${
            activeTab === 'tareas' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          Tareas
        </button>
        <button
          onClick={() => onSelectTab('mantenimiento')}
          className={`px-2 py-1 whitespace-nowrap rounded font-medium ${
            activeTab === 'mantenimiento' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          Mantenimiento
        </button>
        <button
          onClick={() => onSelectTab('calendario')}
          className={`px-2 py-1 whitespace-nowrap rounded font-medium ${
            activeTab === 'calendario' ? 'bg-sky-100 text-sky-800' : 'text-slate-600'
          }`}
        >
          Calendario
        </button>
      </div>
    </header>
  );
};
