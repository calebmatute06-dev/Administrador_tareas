import React, { useState, useEffect } from 'react';
import { X, Wrench, Calendar, Phone, DollarSign } from 'lucide-react';
import { MaintenanceItem, MaintenanceCategory } from '../types/household';
import { calculateMaintenanceDueDate, computeMaintenanceStatus } from '../utils/householdUtils';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<MaintenanceItem>) => void;
  itemToEdit?: MaintenanceItem | null;
}

const CATEGORIES: { value: MaintenanceCategory; label: string }[] = [
  { value: 'climatizacion', label: 'Climatización (Aire Acondicionado, Filtros)' },
  { value: 'fontaneria', label: 'Fontanería, Caldera y Calefón' },
  { value: 'electricidad', label: 'Electricidad e Iluminación' },
  { value: 'electrodomesticos', label: 'Electrodomésticos (Lavavajillas, Campana)' },
  { value: 'seguridad', label: 'Seguridad (Detectores de Humo, Extintor, Gas)' },
  { value: 'estructural', label: 'Estructural, Pintura y Aislamiento' },
  { value: 'jardineria', label: 'Jardinería, Terraza y Riego' },
];

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  itemToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MaintenanceCategory>('climatizacion');
  const [frequencyMonths, setFrequencyMonths] = useState('3');
  const [lastServiceDate, setLastServiceDate] = useState('');
  const [providerName, setProviderName] = useState('');
  const [providerPhone, setProviderPhone] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setCategory(itemToEdit.category);
      setFrequencyMonths(itemToEdit.frequencyMonths.toString());
      setLastServiceDate(itemToEdit.lastServiceDate);
      setProviderName(itemToEdit.providerName || '');
      setProviderPhone(itemToEdit.providerPhone || '');
      setEstimatedCost(itemToEdit.estimatedCost ? itemToEdit.estimatedCost.toString() : '');
      setInstructionsText(itemToEdit.stepsInstructions ? itemToEdit.stepsInstructions.join('\n') : '');
      setNotes(itemToEdit.notes || '');
    } else {
      setTitle('');
      setCategory('climatizacion');
      setFrequencyMonths('3');
      const today = new Date().toISOString().split('T')[0];
      setLastServiceDate(today);
      setProviderName('');
      setProviderPhone('');
      setEstimatedCost('');
      setInstructionsText('');
      setNotes('');
    }
  }, [itemToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !lastServiceDate) return;

    const months = parseInt(frequencyMonths, 10) || 3;
    const nextDueDate = calculateMaintenanceDueDate(lastServiceDate, months);
    const status = computeMaintenanceStatus(nextDueDate);

    const steps = instructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    onSave({
      id: itemToEdit?.id,
      title: title.trim(),
      category,
      frequencyMonths: months,
      lastServiceDate,
      nextDueDate,
      status,
      providerName: providerName.trim() || undefined,
      providerPhone: providerPhone.trim() || undefined,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
      stepsInstructions: steps.length > 0 ? steps : undefined,
      notes: notes.trim() || undefined,
      logs: itemToEdit ? itemToEdit.logs : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 p-6 my-8 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Wrench className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {itemToEdit ? 'Editar Mantenimiento Preventivo' : 'Nuevo Programa de Mantenimiento'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nombre de la revisión o mantenimiento
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Limpieza de filtros A/C, Purga de caldera, Revisión extintor"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Categoría Técnica
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as MaintenanceCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Frecuencia Recomendada
              </label>
              <select
                value={frequencyMonths}
                onChange={(e) => setFrequencyMonths(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-900"
              >
                <option value="1">Cada 1 mes</option>
                <option value="2">Cada 2 meses (Bimestral)</option>
                <option value="3">Cada 3 meses (Trimestral)</option>
                <option value="6">Cada 6 meses (Semestral)</option>
                <option value="12">Cada 12 meses (Anual)</option>
                <option value="24">Cada 24 meses (Bienal)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha del Último Servicio
              </label>
              <input
                type="date"
                required
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Coste Estimado (€ / $)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="0.00 (dejar en 0 si es propio)"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono-numbers bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Técnico o Proveedor (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Bricolaje propio o Servicio Oficial"
                value={providerName}
                onChange={(e) => setProviderName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Teléfono de Contacto (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. +34 912 345 678"
                value={providerPhone}
                onChange={(e) => setProviderPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-900 placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Pasos o Guía Rápida (1 por línea)
            </label>
            <textarea
              rows={3}
              placeholder="1. Desconectar la unidad&#10;2. Extraer filtros de malla y lavar con agua tibia&#10;3. Secar a la sombra antes de reinstalar"
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 text-slate-900 placeholder-slate-400 font-mono"
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
              className="px-4 py-2 text-xs font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
            >
              {itemToEdit ? 'Guardar Cambios' : 'Crear Programa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
