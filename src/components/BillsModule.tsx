import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  Users, 
  DollarSign, 
  Download, 
  Filter,
  Check
} from 'lucide-react';
import { Bill, BillCategory, BillStatus, Member } from '../types/household';
import { 
  formatCurrency, 
  formatDateSpanish, 
  getDaysDifference, 
  getDueStatusText,
  calculateMemberBalances 
} from '../utils/householdUtils';

interface BillsModuleProps {
  bills: Bill[];
  members: Member[];
  onOpenNewBill: () => void;
  onEditBill: (bill: Bill) => void;
  onDeleteBill: (billId: string) => void;
  onOpenPayModal: (bill: Bill) => void;
  onUnpayBill: (billId: string) => void;
}

const CATEGORY_NAMES: Record<BillCategory, string> = {
  luz: 'Energía Eléctrica',
  agua: 'Agua Potable',
  gas: 'Gas Natural',
  internet: 'Internet / Fibra',
  alquiler: 'Alquiler / Hipoteca',
  comunidad: 'Comunidad / Gastos Comunes',
  streaming: 'Suscripciones',
  mantenimiento: 'Mantenimiento',
  otro: 'Otros',
};

export const BillsModule: React.FC<BillsModuleProps> = ({
  bills,
  members,
  onOpenNewBill,
  onEditBill,
  onDeleteBill,
  onOpenPayModal,
  onUnpayBill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showSplitCalculator, setShowSplitCalculator] = useState(true);

  // Filter bills
  const filteredBills = bills.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.referenceNumber && b.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.notes && b.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesStatus = true;
    const days = getDaysDifference(b.dueDate);
    if (statusFilter === 'pendiente') {
      matchesStatus = b.status === 'pendiente' && days >= 0;
    } else if (statusFilter === 'vencido') {
      matchesStatus = b.status === 'pendiente' && days < 0;
    } else if (statusFilter === 'pagado') {
      matchesStatus = b.status === 'pagado';
    }

    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Financial calculations
  const totalAmount = bills.reduce((acc, b) => acc + b.amount, 0);
  const paidAmount = bills.filter((b) => b.status === 'pagado').reduce((acc, b) => acc + b.amount, 0);
  const pendingAmount = bills.filter((b) => b.status === 'pendiente').reduce((acc, b) => acc + b.amount, 0);
  const overdueBills = bills.filter((b) => b.status === 'pendiente' && getDaysDifference(b.dueDate) < 0);

  const balances = calculateMemberBalances(bills, members);

  const handleExportCSV = () => {
    const headers = 'ID,Titulo,Categoria,Importe,Vencimiento,Estado,PagadoPor,Referencia\n';
    const rows = bills.map((b) => {
      const payer = members.find((m) => m.id === b.paidByMemberId)?.name || 'N/A';
      return `"${b.id}","${b.title}","${b.category}",${b.amount},"${b.dueDate}","${b.status}","${payer}","${b.referenceNumber || ''}"`;
    }).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `facturas_hogar_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Financial Metrics */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Gestión de Facturas y Gastos Compartidos
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Control de fechas de vencimiento, pagos centralizados y división automática entre convivientes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar CSV
            </button>

            <button
              onClick={onOpenNewBill}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Nueva Factura
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Presupuesto Total</div>
            <div className="text-xl font-bold font-mono-numbers text-slate-900 mt-0.5">
              {formatCurrency(totalAmount)}
            </div>
            <div className="text-[11px] text-slate-500">{bills.length} facturas registradas</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Total Pagado</div>
            <div className="text-xl font-bold font-mono-numbers text-emerald-600 mt-0.5">
              {formatCurrency(paidAmount)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">
              {bills.filter((b) => b.status === 'pagado').length} liquidadas
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Por Pagar</div>
            <div className="text-xl font-bold font-mono-numbers text-sky-600 mt-0.5">
              {formatCurrency(pendingAmount)}
            </div>
            <div className="text-[11px] text-slate-500">
              {bills.filter((b) => b.status === 'pendiente').length} pendientes
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Vencimientos Críticos</div>
            <div className={`text-xl font-bold font-mono-numbers mt-0.5 ${
              overdueBills.length > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {overdueBills.length}
            </div>
            <div className={`text-[11px] ${
              overdueBills.length > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'
            }`}>
              {overdueBills.length > 0 ? 'Facturas atrasadas' : 'Todo al día'}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Splitting Matrix (Balances & Settlements) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-600" />
            <h2 className="text-sm font-bold text-slate-900">
              División Equitativa del Hogar (¿Quién ha pagado qué?)
            </h2>
          </div>
          <button
            onClick={() => setShowSplitCalculator(!showSplitCalculator)}
            className="text-xs font-medium text-slate-500 hover:text-slate-900"
          >
            {showSplitCalculator ? 'Ocultar balance' : 'Mostrar balance'}
          </button>
        </div>

        {showSplitCalculator && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {balances.map(({ member, totalPaid, totalOwed, netBalance }) => (
              <div
                key={member.id}
                className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full inline-block"
                      style={{ backgroundColor: member.color }}
                    />
                    {member.name.split(' ')[0]}
                  </span>
                  <span
                    className={`font-mono-numbers font-bold ${
                      netBalance > 0
                        ? 'text-emerald-600'
                        : netBalance < 0
                        ? 'text-rose-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {netBalance > 0 ? `+${formatCurrency(netBalance)}` : formatCurrency(netBalance)}
                  </span>
                </div>

                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Ha aportado:</span>
                  <span className="font-mono-numbers">{formatCurrency(totalPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Su cuota total:</span>
                  <span className="font-mono-numbers">{formatCurrency(totalOwed)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar factura o contrato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Filter Controls (Allowed as functional segmented tabs per Section 1.A) */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setStatusFilter('pendiente')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'pendiente' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setStatusFilter('vencido')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'vencido' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vencidas
            </button>
            <button
              onClick={() => setStatusFilter('pagado')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                statusFilter === 'pagado' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pagadas
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-700"
          >
            <option value="all">Todas las categorías</option>
            {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
              <option key={key} value={key}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bills Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {filteredBills.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-800">No se encontraron facturas</div>
            <div className="text-xs text-slate-500 mt-1">
              Prueba cambiando los filtros o registra una nueva factura con el botón superior.
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Concepto / Servicio</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4 text-right">Importe</th>
                  <th className="py-3 px-4">Vencimiento</th>
                  <th className="py-3 px-4">División</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((bill) => {
                  const statusInfo = getDueStatusText(bill.dueDate);
                  const isPaid = bill.status === 'pagado';
                  const payer = members.find((m) => m.id === bill.paidByMemberId);

                  return (
                    <tr
                      key={bill.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Concept */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{bill.title}</div>
                        {bill.referenceNumber && (
                          <div className="text-[11px] text-slate-400 font-mono-numbers mt-0.5">
                            Ref: {bill.referenceNumber}
                          </div>
                        )}
                        {bill.notes && (
                          <div className="text-[11px] text-slate-500 mt-0.5 max-w-xs truncate">
                            {bill.notes}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600">
                        {CATEGORY_NAMES[bill.category] || bill.category}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono-numbers text-sm">
                        {formatCurrency(bill.amount)}
                      </td>

                      {/* Due date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800 font-medium">
                          {formatDateSpanish(bill.dueDate)}
                        </div>
                        <div className={`text-[11px] ${
                          isPaid
                            ? 'text-emerald-600'
                            : statusInfo.urgent
                            ? 'text-rose-600 font-semibold'
                            : 'text-slate-400'
                        }`}>
                          {isPaid ? (bill.paidDate ? `Pagado el ${formatDateSpanish(bill.paidDate)}` : 'Pagado') : statusInfo.text}
                        </div>
                      </td>

                      {/* Splits */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          {bill.splits.map((s) => {
                            const member = members.find((m) => m.id === s.memberId);
                            if (!member) return null;
                            return (
                              <span
                                key={s.memberId}
                                title={`${member.name}: ${formatCurrency(s.amount)}`}
                                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border"
                                style={{
                                  backgroundColor: `${member.color}20`,
                                  color: member.color,
                                  borderColor: `${member.color}40`,
                                }}
                              >
                                {member.name.charAt(0)}
                              </span>
                            );
                          })}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-mono-numbers">
                          {bill.splits.length > 0 ? `${formatCurrency(bill.splits[0].amount)} / pers.` : ''}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Pagado
                          </span>
                        ) : statusInfo.past ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs">
                            <AlertTriangle className="w-3.5 h-3.5" /> Vencida
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sky-700 font-medium text-xs">
                            <Clock className="w-3.5 h-3.5" /> Pendiente
                          </span>
                        )}
                        {payer && isPaid && (
                          <div className="text-[10px] text-slate-500">
                            Por {payer.name.split(' ')[0]}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPaid ? (
                            <button
                              onClick={() => onUnpayBill(bill.id)}
                              className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                              title="Marcar como pendiente"
                            >
                              Deshacer
                            </button>
                          ) : (
                            <button
                              onClick={() => onOpenPayModal(bill)}
                              className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                            >
                              Pagar
                            </button>
                          )}

                          <button
                            onClick={() => onEditBill(bill)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                            title="Editar factura"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => onDeleteBill(bill.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Eliminar factura"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
