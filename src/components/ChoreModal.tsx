import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Clock, User, Home, AlertCircle } from 'lucide-react';
import { Chore, ChoreFrequency, ChorePriority, ChoreRoom, Member } from '../types/household';

interface ChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chore: Partial<Chore>) => void;
  choreToEdit?: Chore | null;
  members: Member[];
}

const ROOMS: { value: ChoreRoom; label: string }[] = [
  { value: 'cocina', label: 'Cocina y Despensa' },
  { value: 'bano', label: 'Baños' },
  { value: 'sala', label: 'Salón y Comedor' },
  { value: 'dormitorios', label: 'Dormitorios y Pasillos' },
  { value: 'jardin', label: 'Terraza, Balcón y Jardín' },
  { value: 'general', label: 'General del Hogar' },
];

export const ChoreModal: React.FC<ChoreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  choreToEdit,
  members,
}) => {
  const [title, setTitle] = useState('');
  const [room, setRoom] = useState<ChoreRoom>('cocina');
  const [frequency, setFrequency] = useState<ChoreFrequency>('semanal');
  const [assignedMemberId, setAssignedMemberId] = useState(members[0]?.id || '');
  const [estimatedMinutes, setEstimatedMinutes] = useState('20');
  const [priority, setPriority] = useState<ChorePriority>('media');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (choreToEdit) {
      setTitle(choreToEdit.title);
      setRoom(choreToEdit.room);
      setFrequency(choreToEdit.frequency);
      setAssignedMemberId(choreToEdit.assignedMemberId);
      setEstimatedMinutes(choreToEdit.estimatedMinutes.toString());
      setPriority(choreToEdit.priority);
      setDescription(choreToEdit.description || '');
    } else {
      setTitle('');
      setRoom('cocina');
      setFrequency('semanal');
      setAssignedMemberId(members[0]?.id || '');
      setEstimatedMinutes('20');
      setPriority('media');
      setDescription('');
    }
  }, [choreToEdit, isOpen, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedMemberId) return;

    onSave({
      id: choreToEdit?.id,
      title: title.trim(),
      room,
      frequency,
      assignedMemberId,
      estimatedMinutes: parseInt(estimatedMinutes, 10) || 15,
      priority,
      description: description.trim() || undefined,
      completedToday: choreToEdit ? choreToEdit.completedToday : false,
      lastCompletedDate: choreToEdit?.lastCompletedDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 p-6 my-8 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {choreToEdit ? 'Editar Tarea Doméstica' : 'Nueva Tarea Doméstica'}
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
              Nombre de la tarea
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Sacar la basura, Limpiar horno, Fregar suelo de la cocina"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Zona / Habitación
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value as ChoreRoom)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
              >
                {ROOMS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Frecuencia
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as ChoreFrequency)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
              >
                <option value="diaria">Diaria</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal (cada 2 semanas)</option>
                <option value="mensual">Mensual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Asignado a
              </label>
              <select
                value={assignedMemberId}
                onChange={(e) => setAssignedMemberId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Tiempo estimado (minutos)
              </label>
              <input
                type="number"
                min="5"
                max="240"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900 font-mono-numbers"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Nivel de Prioridad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['baja', 'media', 'alta'] as ChorePriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border capitalize transition-all ${
                    priority === p
                      ? p === 'alta'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : p === 'media'
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Instrucciones o detalles (Opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Ej. Usar producto desinfectante especial para mármol, ventilar mientras se limpia..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900 placeholder-slate-400"
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
              {choreToEdit ? 'Guardar Cambios' : 'Crear Tarea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
