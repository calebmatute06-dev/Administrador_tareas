import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, Bell, Check, ArrowRight } from 'lucide-react';
import { HouseholdAlert } from '../types/household';

interface AlertsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: HouseholdAlert[];
  onNavigateToTab: (tab: 'resumen' | 'facturas' | 'tareas' | 'mantenimiento') => void;
  onEnableNotifications?: () => void;
  notificationsEnabled?: boolean;
}

export const AlertsDrawer: React.FC<AlertsDrawerProps> = ({
  isOpen,
  onClose,
  alerts,
  onNavigateToTab,
  onEnableNotifications,
  notificationsEnabled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Centro de Avisos del Hogar</h3>
              <p className="text-xs text-slate-500">Recordatorios prioritarios y vencimientos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser notification banner */}
        {onEnableNotifications && (
          <div className="p-3 bg-sky-50 border-b border-sky-100 flex items-center justify-between gap-3 text-xs">
            <div className="text-sky-900">
              {notificationsEnabled
                ? 'Notificaciones del navegador activas.'
                : '¿Deseas recibir avisos de vencimientos en tu pantalla?'}
            </div>
            {!notificationsEnabled && (
              <button
                onClick={onEnableNotifications}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors whitespace-nowrap"
              >
                Activar
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-800">¡Todo al día en el hogar!</div>
              <div className="text-xs mt-1">No hay facturas vencidas ni tareas urgentes pendientes.</div>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  alert.severity === 'urgente'
                    ? 'bg-rose-50/50 border-rose-200'
                    : alert.severity === 'aviso'
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-sky-50/50 border-sky-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">
                    {alert.severity === 'urgente' ? (
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    ) : alert.severity === 'aviso' ? (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <Info className="w-4 h-4 text-sky-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900">{alert.title}</div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{alert.description}</div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-400 capitalize">{alert.type}</span>
                      <button
                        onClick={() => {
                          onClose();
                          if (alert.type === 'bill') onNavigateToTab('facturas');
                          else if (alert.type === 'chore') onNavigateToTab('tareas');
                          else if (alert.type === 'maintenance') onNavigateToTab('mantenimiento');
                        }}
                        className="text-xs font-semibold text-slate-900 hover:text-sky-600 flex items-center gap-1 transition-colors"
                      >
                        Gestionar <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>{alerts.length} recordatorios activos</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
