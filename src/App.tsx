import React, { useState, useEffect } from 'react';
import { 
  INITIAL_BILLS, 
  INITIAL_CHORES, 
  INITIAL_MAINTENANCE, 
  INITIAL_MEMBERS 
} from './data/initialData';
import { 
  Bill, 
  Chore, 
  MaintenanceItem, 
  Member 
} from './types/household';
import { 
  generateHouseholdAlerts, 
  calculateMaintenanceDueDate, 
  computeMaintenanceStatus 
} from './utils/householdUtils';

import { Header } from './components/Header';
import { DashboardOverview } from './components/DashboardOverview';
import { BillsModule } from './components/BillsModule';
import { ChoresModule } from './components/ChoresModule';
import { MaintenanceModule } from './components/MaintenanceModule';
import { CalendarModule } from './components/CalendarModule';
import { QuickActionModal } from './components/QuickActionModal';
import { BillModal } from './components/BillModal';
import { ChoreModal } from './components/ChoreModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { PayBillModal } from './components/PayBillModal';
import { LogServiceModal } from './components/LogServiceModal';
import { HouseholdMembersModal } from './components/HouseholdMembersModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { RotateCcw } from 'lucide-react';

export default function App() {
  // Persistence in localStorage
  const [bills, setBills] = useState<Bill[]>(() => {
    try {
      const saved = localStorage.getItem('hogarsync_bills');
      return saved ? JSON.parse(saved) : INITIAL_BILLS;
    } catch {
      return INITIAL_BILLS;
    }
  });

  const [chores, setChores] = useState<Chore[]>(() => {
    try {
      const saved = localStorage.getItem('hogarsync_chores');
      return saved ? JSON.parse(saved) : INITIAL_CHORES;
    } catch {
      return INITIAL_CHORES;
    }
  });

  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>(() => {
    try {
      const saved = localStorage.getItem('hogarsync_maintenance');
      return saved ? JSON.parse(saved) : INITIAL_MAINTENANCE;
    } catch {
      return INITIAL_MAINTENANCE;
    }
  });

  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem('hogarsync_members');
      return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  // Save to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem('hogarsync_bills', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('hogarsync_chores', JSON.stringify(chores));
  }, [chores]);

  useEffect(() => {
    localStorage.setItem('hogarsync_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('hogarsync_members', JSON.stringify(members));
  }, [members]);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'resumen' | 'facturas' | 'tareas' | 'mantenimiento' | 'calendario'>('resumen');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');

  // Modals state
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billToEdit, setBillToEdit] = useState<Bill | null>(null);

  const [isChoreModalOpen, setIsChoreModalOpen] = useState(false);
  const [choreToEdit, setChoreToEdit] = useState<Chore | null>(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceToEdit, setMaintenanceToEdit] = useState<MaintenanceItem | null>(null);

  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);
  const [billToPay, setBillToPay] = useState<Bill | null>(null);

  const [isLogServiceModalOpen, setIsLogServiceModalOpen] = useState(false);
  const [maintenanceToLog, setMaintenanceToLog] = useState<MaintenanceItem | null>(null);

  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Compute alerts dynamically
  const alerts = generateHouseholdAlerts(bills, chores, maintenance);
  const urgentAlertsCount = alerts.filter((a) => a.severity === 'urgente' || a.severity === 'aviso').length;

  // Browser notifications
  const handleEnableNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          new Notification('HogarSync - Notificaciones activadas', {
            body: `Tienes ${alerts.length} recordatorios activos del hogar.`,
            icon: '/favicon.ico',
          });
        }
      });
    }
  };

  // Bills handlers
  const handleSaveBill = (billData: Partial<Bill>) => {
    if (billData.id) {
      setBills((prev) =>
        prev.map((b) => (b.id === billData.id ? ({ ...b, ...billData } as Bill) : b))
      );
    } else {
      const newBill: Bill = {
        ...billData,
        id: `bill-${Date.now()}`,
      } as Bill;
      setBills((prev) => [newBill, ...prev]);
    }
  };

  const handleDeleteBill = (billId: string) => {
    setBills((prev) => prev.filter((b) => b.id !== billId));
  };

  const handleMarkBillAsPaid = (billId: string, paidByMemberId: string, paidDate: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            status: 'pagado',
            paidByMemberId,
            paidDate,
            splits: b.splits.map((s) => ({ ...s, paid: true })),
          };
        }
        return b;
      })
    );
  };

  const handleUnpayBill = (billId: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id === billId) {
          return {
            ...b,
            status: 'pendiente',
            paidDate: undefined,
            splits: b.splits.map((s) => ({ ...s, paid: false })),
          };
        }
        return b;
      })
    );
  };

  // Chores handlers
  const handleSaveChore = (choreData: Partial<Chore>) => {
    if (choreData.id) {
      setChores((prev) =>
        prev.map((c) => (c.id === choreData.id ? ({ ...c, ...choreData } as Chore) : c))
      );
    } else {
      const newChore: Chore = {
        ...choreData,
        id: `chore-${Date.now()}`,
      } as Chore;
      setChores((prev) => [newChore, ...prev]);
    }
  };

  const handleDeleteChore = (choreId: string) => {
    setChores((prev) => prev.filter((c) => c.id !== choreId));
  };

  const handleToggleChore = (choreId: string) => {
    const today = new Date().toISOString().split('T')[0];
    setChores((prev) =>
      prev.map((c) => {
        if (c.id === choreId) {
          const nextState = !c.completedToday;
          return {
            ...c,
            completedToday: nextState,
            lastCompletedDate: nextState ? today : c.lastCompletedDate,
          };
        }
        return c;
      })
    );
  };

  // Fair task rotation among members
  const handleRotateChores = () => {
    if (members.length < 2) return;
    const memberIds = members.map((m) => m.id);

    setChores((prev) =>
      prev.map((chore) => {
        const currentIndex = memberIds.indexOf(chore.assignedMemberId);
        const nextIndex = (currentIndex + 1) % memberIds.length;
        return {
          ...chore,
          assignedMemberId: memberIds[nextIndex],
          completedToday: false, // reset for the new shift
        };
      })
    );
  };

  // Maintenance handlers
  const handleSaveMaintenance = (itemData: Partial<MaintenanceItem>) => {
    if (itemData.id) {
      setMaintenance((prev) =>
        prev.map((m) => (m.id === itemData.id ? ({ ...m, ...itemData } as MaintenanceItem) : m))
      );
    } else {
      const newItem: MaintenanceItem = {
        ...itemData,
        id: `maint-${Date.now()}`,
        logs: [],
      } as MaintenanceItem;
      setMaintenance((prev) => [newItem, ...prev]);
    }
  };

  const handleDeleteMaintenance = (itemId: string) => {
    setMaintenance((prev) => prev.filter((m) => m.id !== itemId));
  };

  const handleLogService = (
    itemId: string,
    serviceDate: string,
    notes: string,
    cost?: number,
    technician?: string
  ) => {
    setMaintenance((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const nextDueDate = calculateMaintenanceDueDate(serviceDate, item.frequencyMonths);
          const status = computeMaintenanceStatus(nextDueDate);
          return {
            ...item,
            lastServiceDate: serviceDate,
            nextDueDate,
            status,
            logs: [
              {
                date: serviceDate,
                notes,
                cost,
                technician,
              },
              ...item.logs,
            ],
          };
        }
        return item;
      })
    );
  };

  // Member management
  const handleAddMember = (name: string, role: string, email: string) => {
    const colors = ['#0284c7', '#059669', '#7c3aed', '#ea580c', '#db2777', '#0d9488'];
    const chosenColor = colors[members.length % colors.length];
    const newMember: Member = {
      id: `m-${Date.now()}`,
      name,
      role,
      email,
      color: chosenColor,
      avatarBg: 'bg-slate-100 text-slate-800 border-slate-300',
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Reset demo data
  const handleResetData = () => {
    if (window.confirm('¿Deseas restablecer los datos de demostración del hogar?')) {
      setBills(INITIAL_BILLS);
      setChores(INITIAL_CHORES);
      setMaintenance(INITIAL_MAINTENANCE);
      setMembers(INITIAL_MEMBERS);
      localStorage.removeItem('hogarsync_bills');
      localStorage.removeItem('hogarsync_chores');
      localStorage.removeItem('hogarsync_maintenance');
      localStorage.removeItem('hogarsync_members');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        urgentAlertsCount={urgentAlertsCount}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
        onOpenMembers={() => setIsMembersModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'resumen' && (
          <DashboardOverview
            bills={bills}
            chores={chores}
            maintenance={maintenance}
            members={members}
            alerts={alerts}
            selectedMemberFilter={selectedMemberFilter}
            onSelectMemberFilter={setSelectedMemberFilter}
            onNavigateTab={setActiveTab}
            onToggleChore={handleToggleChore}
            onOpenPayModal={(bill) => {
              setBillToPay(bill);
              setIsPayBillModalOpen(true);
            }}
            onOpenLogMaintenance={(item) => {
              setMaintenanceToLog(item);
              setIsLogServiceModalOpen(true);
            }}
            onOpenQuickAction={() => setIsQuickActionOpen(true)}
          />
        )}

        {activeTab === 'facturas' && (
          <BillsModule
            bills={bills}
            members={members}
            onOpenNewBill={() => {
              setBillToEdit(null);
              setIsBillModalOpen(true);
            }}
            onEditBill={(bill) => {
              setBillToEdit(bill);
              setIsBillModalOpen(true);
            }}
            onDeleteBill={handleDeleteBill}
            onOpenPayModal={(bill) => {
              setBillToPay(bill);
              setIsPayBillModalOpen(true);
            }}
            onUnpayBill={handleUnpayBill}
          />
        )}

        {activeTab === 'tareas' && (
          <ChoresModule
            chores={chores}
            members={members}
            onToggleChore={handleToggleChore}
            onOpenNewChore={() => {
              setChoreToEdit(null);
              setIsChoreModalOpen(true);
            }}
            onEditChore={(chore) => {
              setChoreToEdit(chore);
              setIsChoreModalOpen(true);
            }}
            onDeleteChore={handleDeleteChore}
            onRotateChores={handleRotateChores}
          />
        )}

        {activeTab === 'mantenimiento' && (
          <MaintenanceModule
            maintenanceItems={maintenance}
            onOpenNewMaintenance={() => {
              setMaintenanceToEdit(null);
              setIsMaintenanceModalOpen(true);
            }}
            onEditMaintenance={(item) => {
              setMaintenanceToEdit(item);
              setIsMaintenanceModalOpen(true);
            }}
            onDeleteMaintenance={handleDeleteMaintenance}
            onOpenLogServiceModal={(item) => {
              setMaintenanceToLog(item);
              setIsLogServiceModalOpen(true);
            }}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarModule
            bills={bills}
            chores={chores}
            maintenance={maintenance}
            members={members}
            onOpenPayBill={(bill) => {
              setBillToPay(bill);
              setIsPayBillModalOpen(true);
            }}
            onToggleChore={handleToggleChore}
            onOpenLogMaintenance={(item) => {
              setMaintenanceToLog(item);
              setIsLogServiceModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">HogarSync</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Centralización de facturas, tareas domésticas y calendario preventivo</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMembersModalOpen(true)}
              className="hover:text-slate-900 transition-colors"
            >
              Configurar Miembros ({members.length})
            </button>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <button
              onClick={handleResetData}
              className="hover:text-slate-900 flex items-center gap-1 transition-colors text-slate-400 hover:text-slate-600"
              title="Restablece las facturas, tareas y mantenimientos de muestra"
            >
              <RotateCcw className="w-3 h-3" /> Restablecer Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onOpenNewBill={() => {
          setBillToEdit(null);
          setIsBillModalOpen(true);
        }}
        onOpenNewChore={() => {
          setChoreToEdit(null);
          setIsChoreModalOpen(true);
        }}
        onOpenNewMaintenance={() => {
          setMaintenanceToEdit(null);
          setIsMaintenanceModalOpen(true);
        }}
      />

      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        onSave={handleSaveBill}
        billToEdit={billToEdit}
        members={members}
      />

      <ChoreModal
        isOpen={isChoreModalOpen}
        onClose={() => setIsChoreModalOpen(false)}
        onSave={handleSaveChore}
        choreToEdit={choreToEdit}
        members={members}
      />

      <MaintenanceModal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        onSave={handleSaveMaintenance}
        itemToEdit={maintenanceToEdit}
      />

      <PayBillModal
        isOpen={isPayBillModalOpen}
        onClose={() => setIsPayBillModalOpen(false)}
        onMarkAsPaid={handleMarkBillAsPaid}
        bill={billToPay}
        members={members}
      />

      <LogServiceModal
        isOpen={isLogServiceModalOpen}
        onClose={() => setIsLogServiceModalOpen(false)}
        onLogService={handleLogService}
        item={maintenanceToLog}
      />

      <HouseholdMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        members={members}
        bills={bills}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
      />

      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        onNavigateToTab={setActiveTab}
        onEnableNotifications={handleEnableNotifications}
        notificationsEnabled={notificationsEnabled}
      />
    </div>
  );
}
