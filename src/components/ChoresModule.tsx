import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  RotateCw, 
  CheckCircle2, 
  Clock, 
  User, 
  Trash2, 
  Edit2, 
  Sparkles,
  Search
} from 'lucide-react';
import { Chore, ChoreFrequency, ChorePriority, ChoreRoom, Member } from '../types/household';

interface ChoresModuleProps {
  chores: Chore[];
  members: Member[];
  onToggleChore: (choreId: string) => void;
  onOpenNewChore: () => void;
  onEditChore: (chore: Chore) => void;
  onDeleteChore: (choreId: string) => void;
  onRotateChores: () => void;
}

const ROOM_NAMES: Record<ChoreRoom, string> = {
  cocina: 'Cocina',
  bano: 'Baños',
  sala: 'Salón',
  dormitorios: 'Dormitorios',
  jardin: 'Terraza / Jardín',
  general: 'General',
};

export const ChoresModule: React.FC<ChoresModuleProps> = ({
  chores,
  members,
  onToggleChore,
  onOpenNewChore,
  onEditChore,
  onDeleteChore,
  onRotateChores,
}) => {
  const [filterView, setFilterView] = useState<'hoy' | 'semana' | 'todas'>('hoy');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [rotationNotice, setRotationNotice] = useState(false);

  // Filter chores
  const filteredChores = chores.filter((c) => {
    if (filterView === 'hoy') {
      const isDaily = c.frequency === 'diaria';
      const isHighPriority = c.priority === 'alta';
      if (!isDaily && !isHighPriority) return false;
    } else if (filterView === 'semana') {
      if (c.frequency === 'mensual') return false;
    }

    if (selectedMember !== 'all' && c.assignedMemberId !== selectedMember) {
      return false;
    }

    if (selectedRoom !== 'all' && c.room !== selectedRoom) {
      return false;
    }

    return true;
  });

  const handleRotateWithFeedback = () => {
    onRotateChores();
    setRotationNotice(true);
    setTimeout(() => setRotationNotice(false), 4000);
  };

  // Stats
  const todayTasks = chores.filter((c) => c.frequency === 'diaria' || c.priority === 'alta');
  const completedToday = todayTasks.filter((c) => c.completedToday).length;
  const totalMinutes = chores.reduce((acc, c) => acc + c.estimatedMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              División y Turnos de Tareas Domésticas
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Organización equitativa de limpieza, compras y mantenimiento diario para evitar desequilibrios en casa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRotateWithFeedback}
              title="Rota los responsables de las tareas entre los convivientes para que sea 100% justo"
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Rotar Turnos
            </button>

            <button
              onClick={onOpenNewChore}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Nueva Tarea
            </button>
          </div>
        </div>

        {rotationNotice && (
          <div className="my-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in duration-150">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Turnos rotados exitosamente! Se han redistribuido las responsabilidades entre todos los miembros.</span>
          </div>
        )}

        {/* Workload per member strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Cumplimiento Hoy</div>
            <div className="text-xl font-bold font-mono-numbers text-slate-900 mt-0.5">
              {completedToday} / {todayTasks.length}
            </div>
            <div className="text-[11px] text-slate-500">
              {todayTasks.length > 0 ? `${Math.round((completedToday / todayTasks.length) * 100)}% de avance` : 'Sin tareas'}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Total de Tareas</div>
            <div className="text-xl font-bold font-mono-numbers text-slate-900 mt-0.5">
              {chores.length}
            </div>
            <div className="text-[11px] text-slate-500">
              En rotación constante
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Tiempo Invertido</div>
            <div className="text-xl font-bold font-mono-numbers text-slate-900 mt-0.5">
              ~{Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
            </div>
            <div className="text-[11px] text-slate-500">
              Carga total estimada
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Distribución Equitativa</div>
            <div className="text-xl font-bold font-mono-numbers text-emerald-600 mt-0.5">
              100%
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              Turnos balanceados
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Tabs (Functional buttons per Section 1.A) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setFilterView('hoy')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterView === 'hoy' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Para Hoy ({todayTasks.length})
            </button>
            <button
              onClick={() => setFilterView('semana')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterView === 'semana' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Esta Semana
            </button>
            <button
              onClick={() => setFilterView('todas')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                filterView === 'todas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({chores.length})
            </button>
          </div>

          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las habitaciones</option>
            {Object.entries(ROOM_NAMES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Member filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <span className="text-slate-400 text-xs pr-1 flex items-center gap-1">
            <User className="w-3 h-3" /> Asignado:
          </span>
          <button
            onClick={() => setSelectedMember('all')}
            className={`px-2 py-1 rounded font-medium transition-colors ${
              selectedMember === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedMember(m.id)}
              className={`px-2 py-1 rounded font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${
                selectedMember === m.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: m.color }} />
              {m.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Chores Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredChores.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-800">No hay tareas en esta vista</div>
            <div className="text-xs text-slate-500 mt-1">
              Selecciona otro filtro o crea una nueva tarea con el botón superior.
            </div>
          </div>
        ) : (
          filteredChores.map((chore) => {
            const assigned = members.find((m) => m.id === chore.assignedMemberId);
            const isCompleted = chore.completedToday;

            return (
              <div
                key={chore.id}
                className={`p-4 bg-white border rounded-xl transition-all duration-150 flex flex-col justify-between ${
                  isCompleted
                    ? 'border-slate-200 bg-slate-50/60 opacity-60'
                    : 'border-slate-200 hover:border-emerald-300 shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <button
                      onClick={() => onToggleChore(chore.id)}
                      className="flex items-start gap-3 text-left group flex-1"
                    >
                      <div
                        className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${
                          isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white group-hover:border-emerald-500'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                      </div>

                      <div>
                        <div
                          className={`text-sm font-semibold leading-snug ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {chore.title}
                        </div>

                        {chore.description && (
                          <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {chore.description}
                          </div>
                        )}
                      </div>
                    </button>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditChore(chore)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        title="Editar tarea"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteChore(chore.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Eliminar tarea"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metadata footer (No pills, clean unboxed text per Section 1.A) */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 mt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-slate-700">{ROOM_NAMES[chore.room]}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="capitalize">{chore.frequency}</span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="font-mono-numbers">{chore.estimatedMinutes} min</span>
                  </div>

                  {assigned && (
                    <div className="flex items-center gap-1.5 font-medium text-slate-800">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: assigned.color }}
                      />
                      <span>{assigned.name.split(' ')[0]}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
