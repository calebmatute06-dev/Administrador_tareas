import React, { useState, useEffect } from 'react';
import { X, Receipt, DollarSign, Calendar, Users, FileText } from 'lucide-react';
import { Bill, BillCategory, BillFrequency, Member } from '../types/household';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Partial<Bill>) => void;
  billToEdit?: Bill | null;
  members: Member[];
}

const CATEGORIES: { value: BillCategory; label: string }[] = [
  { value: 'luz', label: 'Energía Eléctrica (Luz)' },
  { value: 'agua', label: 'Agua Potable' },
  { value: 'gas', label: 'Gas Natural / Balón' },
  { value: 'internet', label: 'Internet / Fibra / Telefonía' },
  { value: 'alquiler', label: 'Alquiler / Hipoteca' },
  { value: 'comunidad', label: 'Comunidad / Gastos Comunes' },
  { value: 'streaming', label: 'Streaming / Suscripciones' },
  { value: 'mantenimiento', label: 'Mantenimiento / Reparación' },
  { value: 'otro', label: 'Otro Gasto del Hogar' },
];

export const BillModal: React.FC<BillModalProps> = ({
  isOpen,
  onClose,
  onSave,
  billToEdit,
  members,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BillCategory>('luz');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [frequency, setFrequency] = useState<BillFrequency>('mensual');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [splitType, setSplitType] = useState<'equitativo' | 'un_pagador'>('equitativo');
  const [paidByMemberId, setPaidByMemberId] = useState(members[0]?.id || '');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(members.map((m) => m.id));

  useEffect(() => {
    if (billToEdit) {
      setTitle(billToEdit.title);
      setCategory(billToEdit.category);
      setAmount(billToEdit.amount.toString());
      setDueDate(billToEdit.dueDate);
      setFrequency(billToEdit.frequency);
      setReferenceNumber(billToEdit.referenceNumber || '');
      setNotes(billToEdit.notes || '');
      setSplitType(billToEdit.splitType === 'un_pagador' ? 'un_pagador' : 'equitativo');
      setPaidByMemberId(billToEdit.paidByMemberId || members[0]?.id || '');
      setSelectedMembers(billToEdit.splits.map((s) => s.memberId));
    } else {
      setTitle('');
      setCategory('luz');
      setAmount('');
      // default due date: 7 days from now
      const d = new Date();
      d.setDate(d.getDate() + 7);
      setDueDate(d.toISOString().split('T')[0]);
      setFrequency('mensual');
      setReferenceNumber('');
      setNotes('');
      setSplitType('equitativo');
      setPaidByMemberId(members[0]?.id || '');
      setSelectedMembers(members.map((m) => m.id));
    }
  }, [billToEdit, isOpen, members]);

  if (!isOpen) return null;

  const handleMemberToggle = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      if (selectedMembers.length > 1) {
        setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
      }
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !dueDate) {
      return;
    }

    const share = selectedMembers.length > 0 ? parsedAmount / selectedMembers.length : parsedAmount;
    const splits = selectedMembers.map((memberId) => ({
      memberId,
      amount: Math.round(share * 100) / 100,
      paid: billToEdit ? billToEdit.splits.find((s) => s.memberId === memberId)?.paid || false : false,
    }));

    onSave({
      id: billToEdit?.id,
      title: title.trim(),
      category,
      amount: parsedAmount,
      dueDate,
      frequency,
      status: billToEdit ? billToEdit.status : 'pendiente',
      splitType,
      splits,
      paidByMemberId: splitType === 'un_pagador' ? paidByMemberId : billToEdit?.paidByMemberId,
      referenceNumber: referenceNumber.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const numAmount = parseFloat(amount) || 0;
  const splitAmount = selectedMembers.length > 0 ? (numAmount / selectedMembers.length).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 p-6 my-8 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <Receipt className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {billToEdit ? 'Editar Factura o Gasto' : 'Registrar Nueva Factura'}
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
              Nombre de la factura o servicio
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Suministro Eléctrico Octubre, Fibra 600Mb, Alquiler"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BillCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900"
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
                Importe Total (€ / $)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-sm font-semibold">
                  €
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 text-sm font-mono-numbers bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Fecha Límite de Pago
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Periodicidad
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as BillFrequency)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900"
              >
                <option value="mensual">Mensual</option>
                <option value="bimensual">Bimestral (cada 2 meses)</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
                <option value="unico">Pago Único</option>
              </select>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" /> División del Gasto
              </span>
              <span className="text-xs font-medium text-sky-700 font-mono-numbers">
                {selectedMembers.length} {selectedMembers.length === 1 ? 'persona' : 'personas'} · €{splitAmount} / persona
              </span>
            </div>

            <div className="text-xs text-slate-500">
              Selecciona quiénes participan en el pago de esta factura:
            </div>

            <div className="flex flex-wrap gap-2">
              {members.map((member) => {
                const isSelected = selectedMembers.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => handleMemberToggle(member.id)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-sky-50 border-sky-300 text-sky-900 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: member.color }} />
                    {member.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                N° de Referencia / Contrato (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. REC-99210 o Ref. Pago"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Notas adicionales (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Débito automático en cuenta BBVA"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500 text-slate-900 placeholder-slate-400"
              />
            </div>
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
              className="px-4 py-2 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors shadow-xs"
            >
              {billToEdit ? 'Guardar Cambios' : 'Registrar Factura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
