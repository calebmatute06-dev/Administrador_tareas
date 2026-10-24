import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Receipt, 
  CheckSquare, 
  Wrench, 
  Calendar as CalendarIcon, 
  X,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Bill, Chore, MaintenanceItem, Member } from '../types/household';
import { formatCurrency, formatDateSpanish } from '../utils/householdUtils';

interface CalendarModuleProps {
  bills: Bill[];
  chores: Chore[];
  maintenance: MaintenanceItem[];
  members: Member[];
  onOpenPayBill: (bill: Bill) => void;
  onToggleChore: (choreId: string) => void;
  onOpenLogMaintenance: (item: MaintenanceItem) => void;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({
  bills,
  chores,
  maintenance,
  members,
  onOpenPayBill,
  onToggleChore,
  onOpenLogMaintenance,
}) => {
  // Calendar current view month and year
  const [currentDate, setCurrentDate] = useState(() => {
    // Current date from metadata is October 2026
    return new Date(2026, 9, 1); // 9 is October (0-indexed)
  });

  const [selectedDayString, setSelectedDayString] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayString(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayString(null);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Day of week of 1st day (0 is Sun, 1 is Mon... convert to Mon=0, Sun=6)
  let startDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startDayOfWeek === -1) startDayOfWeek = 6;

  // Calendar cells
  const calendarCells = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      day,
      dateString: formattedDay,
    });
  }

  // Find events for each day
  const getEventsForDate = (dateString: string) => {
    const dayBills = bills.filter((b) => b.dueDate === dateString);
    const dayMaintenance = maintenance.filter((m) => m.nextDueDate === dateString);
    
    // For chores: show if daily or weekly matching day
    const dayChores = chores.filter((c) => {
      if (c.frequency === 'diaria') return true;
      if (c.lastCompletedDate === dateString) return true;
      return false;
    });

    return { dayBills, dayMaintenance, dayChores };
  };

  const selectedEvents = selectedDayString ? getEventsForDate(selectedDayString) : null;

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Calendario Unificado del Hogar
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Vista completa de vencimientos de servicios, tareas programadas y revisiones de mantenimiento.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-900 px-3 whitespace-nowrap">
                {monthNames[month]} {year}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-3 text-xs text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />
            <span>Factura por pagar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Tareas domésticas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Mantenimiento preventivo</span>
          </div>
        </div>
      </div>

      {/* Main Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className={`transition-all ${selectedDayString ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {/* Days of week */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-semibold text-slate-500 py-2.5">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mié</span>
              <span>Jue</span>
              <span>Vie</span>
              <span>Sáb</span>
              <span>Dom</span>
            </div>

            {/* Cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
              {calendarCells.map((cell, idx) => {
                if (!cell) {
                  return <div key={`empty-${idx}`} className="min-h-24 bg-slate-50/40 p-2" />;
                }

                const { dayBills, dayMaintenance, dayChores } = getEventsForDate(cell.dateString);
                const hasEvents = dayBills.length > 0 || dayMaintenance.length > 0 || dayChores.length > 0;
                const isSelected = selectedDayString === cell.dateString;
                const isToday = cell.dateString === '2026-10-24'; // System reference date

                return (
                  <div
                    key={cell.dateString}
                    onClick={() => setSelectedDayString(cell.dateString)}
                    className={`min-h-24 p-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-sky-50/70 ring-2 ring-sky-500 inset-0 z-10'
                        : isToday
                        ? 'bg-amber-50/30 hover:bg-slate-50'
                        : 'bg-white hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-mono-numbers font-semibold ${
                          isToday
                            ? 'w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]'
                            : 'text-slate-800'
                        }`}
                      >
                        {cell.day}
                      </span>
                      {isToday && (
                        <span className="text-[9px] font-bold text-amber-700 uppercase">
                          Hoy
                        </span>
                      )}
                    </div>

                    {/* Indicators list */}
                    <div className="mt-1.5 space-y-1">
                      {dayBills.map((b) => (
                        <div
                          key={b.id}
                          className={`text-[10px] px-1.5 py-0.5 rounded truncate font-medium flex items-center gap-1 ${
                            b.status === 'pagado'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                              : 'bg-sky-50 text-sky-800 border border-sky-100'
                          }`}
                        >
                          <Receipt className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{b.title}</span>
                        </div>
                      ))}

                      {dayMaintenance.map((m) => (
                        <div
                          key={m.id}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium bg-amber-50 text-amber-900 border border-amber-100 flex items-center gap-1"
                        >
                          <Wrench className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{m.title}</span>
                        </div>
                      ))}

                      {dayChores.slice(0, 1).map((c) => (
                        <div
                          key={c.id}
                          className="text-[10px] px-1.5 py-0.5 rounded truncate font-medium bg-emerald-50 text-emerald-900 border border-emerald-100 flex items-center gap-1"
                        >
                          <CheckSquare className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{c.title}</span>
                        </div>
                      ))}

                      {dayChores.length > 1 && (
                        <div className="text-[9px] text-slate-400 pl-1 font-mono-numbers">
                          +{dayChores.length - 1} tareas más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Details Side Panel */}
        {selectedDayString && selectedEvents && (
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Detalle del Día
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {formatDateSpanish(selectedDayString)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDayString(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Facturas */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-sky-600" /> Facturas con Vencimiento ({selectedEvents.dayBills.length})
              </div>
              {selectedEvents.dayBills.length === 0 ? (
                <div className="text-xs text-slate-400 py-1">Ninguna factura vence hoy.</div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.dayBills.map((b) => (
                    <div
                      key={b.id}
                      className="p-3 bg-sky-50/50 border border-sky-100 rounded-lg text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{b.title}</div>
                        <div className="text-sky-700 font-mono-numbers font-bold mt-0.5">
                          {formatCurrency(b.amount)}
                        </div>
                      </div>
                      {b.status === 'pagado' ? (
                        <span className="text-[11px] font-semibold text-emerald-700">Pagado</span>
                      ) : (
                        <button
                          onClick={() => onOpenPayBill(b)}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded transition-colors"
                        >
                          Pagar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mantenimiento */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-amber-600" /> Revisiones Técnicas ({selectedEvents.dayMaintenance.length})
              </div>
              {selectedEvents.dayMaintenance.length === 0 ? (
                <div className="text-xs text-slate-400 py-1">Ningún servicio programado.</div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.dayMaintenance.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{m.title}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">
                          {m.providerName || 'Mantenimiento del hogar'}
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenLogMaintenance(m)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded transition-colors"
                      >
                        Registrar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tareas */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Tareas del Hogar ({selectedEvents.dayChores.length})
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {selectedEvents.dayChores.map((c) => {
                  const assigned = members.find((m) => m.id === c.assignedMemberId);
                  return (
                    <div
                      key={c.id}
                      onClick={() => onToggleChore(c.id)}
                      className="p-2 rounded bg-slate-50 border border-slate-200 text-xs flex items-center justify-between cursor-pointer hover:bg-slate-100"
                    >
                      <span className={`truncate ${c.completedToday ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {c.title}
                      </span>
                      {assigned && (
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {assigned.name.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
