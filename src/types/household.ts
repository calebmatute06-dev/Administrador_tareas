export type BillCategory = 
  | 'luz' 
  | 'agua' 
  | 'gas' 
  | 'internet' 
  | 'alquiler' 
  | 'comunidad' 
  | 'streaming' 
  | 'mantenimiento' 
  | 'otro';

export type BillStatus = 'pendiente' | 'pagado' | 'vencido';

export type BillFrequency = 'mensual' | 'bimensual' | 'trimestral' | 'anual' | 'unico';

export interface BillSplit {
  memberId: string;
  amount: number;
  paid: boolean;
}

export interface Bill {
  id: string;
  title: string;
  category: BillCategory;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: BillStatus;
  frequency: BillFrequency;
  splitType: 'equitativo' | 'personalizado' | 'un_pagador';
  splits: BillSplit[];
  paidByMemberId?: string;
  paidDate?: string;
  notes?: string;
  referenceNumber?: string;
}

export type ChoreRoom = 'cocina' | 'bano' | 'sala' | 'dormitorios' | 'jardin' | 'general';
export type ChoreFrequency = 'diaria' | 'semanal' | 'quincenal' | 'mensual';
export type ChorePriority = 'alta' | 'media' | 'baja';

export interface Chore {
  id: string;
  title: string;
  room: ChoreRoom;
  frequency: ChoreFrequency;
  assignedMemberId: string;
  estimatedMinutes: number;
  priority: ChorePriority;
  description?: string;
  completedToday?: boolean;
  lastCompletedDate?: string; // YYYY-MM-DD
  completedByMemberId?: string;
}

export type MaintenanceCategory = 
  | 'climatizacion' 
  | 'fontaneria' 
  | 'electricidad' 
  | 'electrodomesticos' 
  | 'seguridad' 
  | 'estructural' 
  | 'jardineria';

export type MaintenanceStatus = 'al_dia' | 'proximo' | 'urgente';

export interface MaintenanceLog {
  date: string;
  technician?: string;
  cost?: number;
  notes: string;
}

export interface MaintenanceItem {
  id: string;
  title: string;
  category: MaintenanceCategory;
  frequencyMonths: number;
  lastServiceDate: string; // YYYY-MM-DD
  nextDueDate: string; // YYYY-MM-DD
  status: MaintenanceStatus;
  estimatedCost?: number;
  providerName?: string;
  providerPhone?: string;
  stepsInstructions?: string[];
  notes?: string;
  logs: MaintenanceLog[];
}

export interface Member {
  id: string;
  name: string;
  role: string; // e.g. "Titular", "Roommate", "Hermano", "Madre"
  email: string;
  color: string;
  avatarBg: string;
}

export interface HouseholdAlert {
  id: string;
  type: 'bill' | 'chore' | 'maintenance';
  title: string;
  description: string;
  date: string;
  severity: 'urgente' | 'aviso' | 'info';
  itemId: string;
}
