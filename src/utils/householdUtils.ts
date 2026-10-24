import { Bill, Chore, MaintenanceItem, Member, HouseholdAlert } from '../types/household';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateSpanish(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }
  return dateString;
}

export function getDaysDifference(targetDateString: string, baseDate: Date = new Date()): number {
  if (!targetDateString) return 0;
  const parts = targetDateString.split('-');
  if (parts.length !== 3) return 0;
  
  const target = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );
  
  // Set to midnight for clean comparison
  target.setHours(0, 0, 0, 0);
  const base = new Date(baseDate);
  base.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - base.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function getDueStatusText(dueDateString: string): { text: string; urgent: boolean; past: boolean } {
  const days = getDaysDifference(dueDateString);
  if (days < 0) {
    const absDays = Math.abs(days);
    return {
      text: `Venció hace ${absDays} ${absDays === 1 ? 'día' : 'días'}`,
      urgent: true,
      past: true,
    };
  }
  if (days === 0) {
    return { text: 'Vence hoy', urgent: true, past: false };
  }
  if (days === 1) {
    return { text: 'Vence mañana', urgent: true, past: false };
  }
  if (days <= 5) {
    return { text: `Vence en ${days} días`, urgent: true, past: false };
  }
  return { text: `En ${days} días`, urgent: false, past: false };
}

export function calculateMaintenanceDueDate(lastServiceDate: string, frequencyMonths: number): string {
  const parts = lastServiceDate.split('-');
  if (parts.length !== 3) return lastServiceDate;
  
  const date = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10)
  );
  
  date.setMonth(date.getMonth() + frequencyMonths);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computeMaintenanceStatus(nextDueDate: string): 'al_dia' | 'proximo' | 'urgente' {
  const days = getDaysDifference(nextDueDate);
  if (days < 0) return 'urgente';
  if (days <= 14) return 'proximo';
  return 'al_dia';
}

export function generateHouseholdAlerts(
  bills: Bill[],
  chores: Chore[],
  maintenance: MaintenanceItem[]
): HouseholdAlert[] {
  const alerts: HouseholdAlert[] = [];

  // Check bills
  bills.forEach((bill) => {
    if (bill.status !== 'pagado') {
      const days = getDaysDifference(bill.dueDate);
      if (days < 0) {
        alerts.push({
          id: `alert-bill-${bill.id}`,
          type: 'bill',
          title: `Factura vencida: ${bill.title}`,
          description: `Importe de ${formatCurrency(bill.amount)} venció hace ${Math.abs(days)} días (${formatDateSpanish(bill.dueDate)}).`,
          date: bill.dueDate,
          severity: 'urgente',
          itemId: bill.id,
        });
      } else if (days <= 5) {
        alerts.push({
          id: `alert-bill-${bill.id}`,
          type: 'bill',
          title: `Vencimiento próximo: ${bill.title}`,
          description: `Vence ${days === 0 ? 'hoy' : days === 1 ? 'mañana' : `en ${days} días`} (${formatCurrency(bill.amount)}).`,
          date: bill.dueDate,
          severity: 'aviso',
          itemId: bill.id,
        });
      }
    }
  });

  // Check chores (today's pending high/medium chores)
  const pendingChores = chores.filter((c) => !c.completedToday && (c.frequency === 'diaria' || c.priority === 'alta'));
  if (pendingChores.length > 0) {
    alerts.push({
      id: 'alert-chores-today',
      type: 'chore',
      title: `${pendingChores.length} tareas domésticas prioritarias hoy`,
      description: `Incluye: ${pendingChores.slice(0, 2).map((c) => c.title).join(', ')}${pendingChores.length > 2 ? '...' : ''}.`,
      date: new Date().toISOString().split('T')[0],
      severity: 'aviso',
      itemId: 'chores-tab',
    });
  }

  // Check maintenance
  maintenance.forEach((m) => {
    const days = getDaysDifference(m.nextDueDate);
    if (days < 0) {
      alerts.push({
        id: `alert-maint-${m.id}`,
        type: 'maintenance',
        title: `Mantenimiento vencido: ${m.title}`,
        description: `Revisión requerida (${formatDateSpanish(m.nextDueDate)}). Evita daños mayores en las instalaciones.`,
        date: m.nextDueDate,
        severity: 'urgente',
        itemId: m.id,
      });
    } else if (days <= 10) {
      alerts.push({
        id: `alert-maint-${m.id}`,
        type: 'maintenance',
        title: `Mantenimiento preventivo cercano: ${m.title}`,
        description: `Programado para ${days === 0 ? 'hoy' : `en ${days} días`}.`,
        date: m.nextDueDate,
        severity: 'info',
        itemId: m.id,
      });
    }
  });

  return alerts;
}

export interface MemberBalance {
  member: Member;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // positive = should receive, negative = should pay
}

export function calculateMemberBalances(bills: Bill[], members: Member[]): MemberBalance[] {
  const memberMap = new Map<string, { totalPaid: number; totalOwed: number }>();

  members.forEach((m) => {
    memberMap.set(m.id, { totalPaid: 0, totalOwed: 0 });
  });

  bills.forEach((bill) => {
    // If a member paid the full bill upfront
    if (bill.paidByMemberId && memberMap.has(bill.paidByMemberId)) {
      const current = memberMap.get(bill.paidByMemberId)!;
      current.totalPaid += bill.amount;
    }

    // Splits: how much each member is responsible for
    bill.splits.forEach((split) => {
      if (memberMap.has(split.memberId)) {
        const current = memberMap.get(split.memberId)!;
        current.totalOwed += split.amount;
      }
    });
  });

  return members.map((m) => {
    const data = memberMap.get(m.id) || { totalPaid: 0, totalOwed: 0 };
    return {
      member: m,
      totalPaid: data.totalPaid,
      totalOwed: data.totalOwed,
      netBalance: data.totalPaid - data.totalOwed,
    };
  });
}
