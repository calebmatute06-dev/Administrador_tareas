import React from 'react';
import { 
  Receipt, 
  CheckSquare, 
  Wrench, 
  ArrowRightLeft, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  User,
  PlusCircle,
  Sparkles
} from 'lucide-react';
import { Bill, Chore, MaintenanceItem, Member, HouseholdAlert } from '../types/household';
import { 
  formatCurrency, 
  formatDateSpanish, 
  getDaysDifference, 
  getDueStatusText,
  calculateMemberBalances 
} from '../utils/householdUtils';

interface DashboardOverviewProps {
  bills: Bill[];
  chores: Chore[];
  maintenance: MaintenanceItem[];
  members: Member[];
  alerts: HouseholdAlert[];
  selectedMemberFilter: string; // 'all' or memberId
  onSelectMemberFilter: (memberId: string) => void;
  onNavigateTab: (tab: 'facturas' | 'tareas' | 'mantenimiento' | 'calendario') => void;
  onToggleChore: (choreId: string) => void;
  onOpenPayModal: (bill: Bill) => void;
  onOpenLogMaintenance: (item: MaintenanceItem) => void;
  onOpenQuickAction: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  bills,
  chores,
  maintenance,
  members,
  alerts,
  selectedMemberFilter,
  onSelectMemberFilter,
  onNavigateTab,
  onToggleChore,
  onOpenPayModal,
  onOpenLogMaintenance,
  onOpenQuickAction,
}) => {
  // Filtered bills
  const activeBills = bills.filter((b) => {
    if (selectedMemberFilter === 'all') return true;
    return b.splits.some((s) => s.memberId === selectedMemberFilter);
  });

  const pendingBills = activeBills.filter((b) => b.status === 'pendiente');
  const paidBills = activeBills.filter((b) => b.status === 'pagado');
  const totalPendingAmount = pendingBills.reduce((acc, b) => {
    if (selectedMemberFilter === 'all') return acc + b.amount;
    const split = b.splits.find((s) => s.memberId === selectedMemberFilter);
    return acc + (split?.amount || 0);
  }, 0);

  const totalPaidAmount = paidBills.reduce((acc, b) => {
    if (selectedMemberFilter === 'all') return acc + b.amount;
    const split = b.splits.find((s) => s.memberId === selectedMemberFilter);
    return acc + (split?.amount || 0);
  }, 0);

  // Chores for today
  const activeChores = chores.filter((c) => {
    if (selectedMemberFilter === 'all') return true;
    return c.assignedMemberId === selectedMemberFilter;
  });

  const todayChores = activeChores.filter((c) => c.frequency === 'diaria' || c.priority === 'alta');
  const completedTodayCount = todayChores.filter((c) => c.completedToday).length;
  const choresProgressPct = todayChores.length > 0 ? Math.round((completedTodayCount / todayChores.length) * 100) : 100;

  // Next critical maintenance
  const sortedMaintenance = [...maintenance].sort((a, b) => {
    return new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime();
  });
  const urgentMaintenance = sortedMaintenance[0];

  // Active member details if selected
  const currentMember = members.find((m) => m.id === selectedMemberFilter);

  // Unified timeline items for next 7 days
  interface TimelineItem {
    id: string;
    type: 'bill' | 'chore' | 'maintenance';
    title: string;
    date: string;
    meta: string;
    urgent: boolean;
    dueText: string;
    actionLabel: string;
    onAction: () => void;
  }

  const timelineItems: TimelineItem[] = [];

  // Upcoming bills
  pendingBills.forEach((b) => {
    const days = getDaysDifference(b.dueDate);
    if (days >= -10 && days <= 10) {
      const statusInfo = getDueStatusText(b.dueDate);
      timelineItems.push({
        id: `bill-${b.id}`,
        type: 'bill',
        title: b.title,
        date: b.dueDate,
        meta: formatCurrency(b.amount),
        urgent: statusInfo.urgent,
        dueText: statusInfo.text,
        actionLabel: 'Pagar',
        onAction: () => onOpenPayModal(b),
      });
    }
  });

  // Today's pending chores
  todayChores.filter((c) => !c.completedToday).forEach((c) => {
    const assigned = members.find((m) => m.id === c.assignedMemberId);
    timelineItems.push({
      id: `chore-${c.id}`,
      type: 'chore',
      title: c.title,
      date: new Date().toISOString().split('T')[0],
      meta: `${c.estimatedMinutes} min · ${assigned?.name.split(' ')[0] || 'Asignado'}`,
      urgent: c.priority === 'alta',
      dueText: 'Hoy',
      actionLabel: 'Completar',
      onAction: () => onToggleChore(c.id),
    });
  });

  // Upcoming maintenance
  sortedMaintenance.slice(0, 3).forEach((m) => {
    const days = getDaysDifference(m.nextDueDate);
    if (days <= 20) {
      const statusInfo = getDueStatusText(m.nextDueDate);
      timelineItems.push({
        id: `maint-${m.id}`,
        type: 'maintenance',
        title: m.title,
        date: m.nextDueDate,
        meta: m.providerName || 'Mantenimiento del hogar',
        urgent: statusInfo.urgent,
        dueText: statusInfo.text,
        actionLabel: 'Registrar',
        onAction: () => onOpenLogMaintenance(m),
      });
    }
  });

  // Sort timeline
  timelineItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6">
      {/* Top Welcome & Member Perspective Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Panel de Control del Hogar
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
              Activo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Centralización en tiempo real de facturas, tareas domésticas, revisiones técnicas y alertas compartidas.
          </p>
        </div>

        {/* Member filter switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg shrink-0">
          <span className="text-xs font-medium text-slate-500 pl-2 pr-1 flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Ver:
          </span>
          <button
            onClick={() => onSelectMemberFilter('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              selectedMemberFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todo el Hogar
          </button>
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => onSelectMemberFilter(member.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                selectedMemberFilter === member.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              {member.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Facturas */}
        <div 
          onClick={() => onNavigateTab('facturas')}
          className="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-sky-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Facturas y Servicios</span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900">
            {formatCurrency(totalPendingAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
            <span>{pendingBills.length} {pendingBills.length === 1 ? 'pendiente' : 'pendientes'}</span>
            <span className="text-emerald-600 font-medium font-mono-numbers">
              {formatCurrency(totalPaidAmount)} pagado
            </span>
          </div>
        </div>

        {/* Card 2: Tareas */}
        <div 
          onClick={() => onNavigateTab('tareas')}
          className="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tareas de Hoy</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900">
            {completedTodayCount} <span className="text-sm font-normal text-slate-400">/ {todayChores.length}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${choresProgressPct}%` }}
            />
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {choresProgressPct === 100 ? '¡Todas las tareas al día!' : `${choresProgressPct}% completadas hoy`}
          </div>
        </div>

        {/* Card 3: Mantenimiento */}
        <div 
          onClick={() => onNavigateTab('mantenimiento')}
          className="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Mantenimiento</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          {urgentMaintenance ? (
            <>
              <div className="text-sm font-bold text-slate-900 truncate" title={urgentMaintenance.title}>
                {urgentMaintenance.title}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                <span>{getDueStatusText(urgentMaintenance.nextDueDate).text}</span>
                <span className={`text-[11px] font-semibold ${
                  urgentMaintenance.status === 'urgente' ? 'text-rose-600' : 'text-amber-600'
                }`}>
                  {urgentMaintenance.status === 'urgente' ? 'Vencido' : 'Próximo'}
                </span>
              </div>
            </>
          ) : (
            <div className="text-sm font-medium text-slate-500 mt-2">Todo en regla</div>
          )}
        </div>

        {/* Card 4: Calendario / Alertas */}
        <div 
          onClick={() => onNavigateTab('calendario')}
          className="bg-white border border-slate-200 rounded-xl p-4.5 hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Agenda Mensual</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono-numbers text-slate-900">
            {timelineItems.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Eventos programados en los próximos 7 días
          </div>
        </div>
      </div>

      {/* Main Dual Grid: Timeline on left, Quick Action Tasks & Bills on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Unified 7-Day Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  Próximos Compromisos del Hogar (Agenda Unificada)
                </h2>
              </div>
              <button
                onClick={() => onNavigateTab('calendario')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
              >
                Ver Calendario Completo <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {timelineItems.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay compromisos urgentes para esta semana.
              </div>
            ) : (
              <div className="space-y-2.5">
                {timelineItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg shrink-0 ${
                        item.type === 'bill'
                          ? 'bg-sky-50 text-sky-700'
                          : item.type === 'chore'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {item.type === 'bill' ? (
                          <Receipt className="w-4 h-4" />
                        ) : item.type === 'chore' ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Wrench className="w-4 h-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="font-mono-numbers">{item.meta}</span>
                          <span>·</span>
                          <span className={item.urgent ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                            {item.dueText}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={item.onAction}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
                    >
                      {item.actionLabel}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chores Checklist & Immediate Reminders */}
        <div className="lg:col-span-5 space-y-4">
          {/* Today's chores checklist */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900">Tareas de Limpieza y Hogar Hoy</h2>
              </div>
              <button
                onClick={() => onNavigateTab('tareas')}
                className="text-xs font-medium text-emerald-600 hover:underline"
              >
                Ver todas
              </button>
            </div>

            <div className="space-y-2">
              {todayChores.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No hay tareas programadas para hoy con este filtro.
                </div>
              ) : (
                todayChores.map((chore) => {
                  const assigned = members.find((m) => m.id === chore.assignedMemberId);
                  return (
                    <div
                      key={chore.id}
                      onClick={() => onToggleChore(chore.id)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        chore.completedToday
                          ? 'bg-slate-50/70 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                          chore.completedToday
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white hover:border-emerald-500'
                        }`}>
                          {chore.completedToday && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-xs font-medium truncate ${
                          chore.completedToday ? 'line-through text-slate-500' : 'text-slate-800'
                        }`}>
                          {chore.title}
                        </span>
                      </div>

                      {assigned && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0"
                          style={{
                            backgroundColor: `${assigned.color}15`,
                            color: assigned.color,
                          }}
                        >
                          {assigned.name.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Problem Solver Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              Solución Centralizada
            </div>
            <h3 className="text-sm font-bold">
              ¿Por qué se olvidan las cosas en el hogar?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              La falta de un sistema único genera discusiones por dinero y electrodomésticos averiados por falta de mantenimiento. HogarSync centraliza los pagos, distribuye el trabajo equitativamente y avisa con antelación.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={onOpenQuickAction}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Registrar nueva responsabilidad
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
