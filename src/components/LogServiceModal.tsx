import React, { useState } from 'react';
import { X, CheckCircle2, DollarSign, Calendar, User } from 'lucide-react';
import { MaintenanceItem } from '../types/household';

interface LogServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogService: (itemId: string, serviceDate: string, notes: string, cost?: number, technician?: string) => void;
  item: MaintenanceItem | null;
}

export const LogServiceModal: React.FC<LogServiceModalProps> = ({
  isOpen,
  onClose,
  onLogService,
  item,
}) => {
  const [serviceDate, setServiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [technician, setTechnician] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('Revisión y mantenimiento completado satisfactoriamente.');

  if (!isOpen || !item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogService(
      item.id,
      serviceDate,
      notes.trim(),
      cost ? parseFloat(cost) : undefined,
      technician.trim() || undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Registrar Mantenimiento Hecho</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Item a actualizar:</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</div>
          <div className="text-xs text-slate-600 mt-1">
            Frecuencia: cada {item.frequencyMonths} {item.frequencyMonths === 1 ? 'mes' : 'meses'}. Al guardar, la próxima fecha se calculará automáticamente.
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Fecha en que se realizó
            </label>
            <input
              type="date"
              required
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Coste Total (€)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="0.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-numbers bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Técnico o Quien lo hizo
              </label>
              <input
                type="text"
                placeholder="Ej. Bricolaje propio / Mario"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Detalle o Notas del servicio
            </label>
            <textarea
              rows={2}
              required
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
            >
              Actualizar Mantenimiento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
