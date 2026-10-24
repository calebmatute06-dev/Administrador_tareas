import React, { useState } from 'react';
import { X, Receipt, CheckSquare, Wrench } from 'lucide-react';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewBill: () => void;
  onOpenNewChore: () => void;
  onOpenNewMaintenance: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onOpenNewBill,
  onOpenNewChore,
  onOpenNewMaintenance,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-base font-semibold text-slate-900">Registrar en el Hogar</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Selecciona qué responsabilidad deseas agregar al sistema centralizado:
        </p>

        <div className="grid gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenNewBill();
            }}
            className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all text-left group"
          >
            <div className="p-2.5 rounded-lg bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white transition-colors shrink-0">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Nueva Factura o Gasto</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Registra luz, internet, alquiler, agua o gastos comunes con fecha de vencimiento y división.
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNewChore();
            }}
            className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Nueva Tarea Doméstica</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Asigna limpieza, cocina, compras o basura con frecuencia diaria, semanal o turnos rotativos.
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNewMaintenance();
            }}
            className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all text-left group"
          >
            <div className="p-2.5 rounded-lg bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">Programa de Mantenimiento</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Programa revisiones de caldera, filtros de aire, campana, extintor o fumigación preventiva.
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
