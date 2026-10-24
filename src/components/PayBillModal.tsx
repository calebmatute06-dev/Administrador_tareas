import React, { useState } from 'react';
import { X, CheckCircle, DollarSign, Calendar, User } from 'lucide-react';
import { Bill, Member } from '../types/household';
import { formatCurrency, formatDateSpanish } from '../utils/householdUtils';

interface PayBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMarkAsPaid: (billId: string, paidByMemberId: string, paidDate: string) => void;
  bill: Bill | null;
  members: Member[];
}

export const PayBillModal: React.FC<PayBillModalProps> = ({
  isOpen,
  onClose,
  onMarkAsPaid,
  bill,
  members,
}) => {
  const [paidByMemberId, setPaidByMemberId] = useState(members[0]?.id || '');
  const [paidDate, setPaidDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen || !bill) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMarkAsPaid(bill.id, paidByMemberId, paidDate);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 p-6 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Confirmar Pago de Factura</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Factura a liquidar:</div>
          <div className="text-base font-bold text-slate-900 mt-0.5">{bill.title}</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 text-xs text-slate-600">
            <span>Importe: <strong className="text-slate-900 font-mono-numbers">{formatCurrency(bill.amount)}</strong></span>
            <span>Vencimiento: {formatDateSpanish(bill.dueDate)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              ¿Quién realizó el pago?
            </label>
            <select
              value={paidByMemberId}
              onChange={(e) => setPaidByMemberId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              El importe se computará a favor de este miembro en el balance compartido del hogar.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Fecha de Pago
            </label>
            <input
              type="date"
              required
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 text-slate-900"
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
              Confirmar como Pagada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
