import React, { useState } from 'react';
import { X, Users, UserPlus, Trash2, ArrowRightLeft, ShieldCheck, Mail, Sparkles } from 'lucide-react';
import { Member, Bill } from '../types/household';
import { calculateMemberBalances, formatCurrency } from '../utils/householdUtils';

interface HouseholdMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  bills: Bill[];
  onAddMember: (name: string, role: string, email: string) => void;
  onRemoveMember: (id: string) => void;
}

const AVATAR_COLORS = [
  { color: '#0284c7', bg: 'bg-sky-100 text-sky-800 border-sky-300' },
  { color: '#059669', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { color: '#7c3aed', bg: 'bg-purple-100 text-purple-800 border-purple-300' },
  { color: '#ea580c', bg: 'bg-orange-100 text-orange-800 border-orange-300' },
  { color: '#db2777', bg: 'bg-pink-100 text-pink-800 border-pink-300' },
  { color: '#0d9488', bg: 'bg-teal-100 text-teal-800 border-teal-300' },
];

export const HouseholdMembersModal: React.FC<HouseholdMembersModalProps> = ({
  isOpen,
  onClose,
  members,
  bills,
  onAddMember,
  onRemoveMember,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Roommate');
  const [email, setEmail] = useState('');

  if (!isOpen) return null;

  const balances = calculateMemberBalances(bills, members);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddMember(name.trim(), role.trim(), email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@hogar.com`);
    setName('');
    setEmail('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-xl border border-slate-200 p-6 my-8 animate-in fade-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Miembros del Hogar y Saldos</h3>
              <p className="text-xs text-slate-500">Gestión de integrantes y balance financiero del hogar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member balances summary */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              Estado de Cuentas Compartidas
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-medium text-sky-600 hover:text-sky-700 flex items-center gap-1 hover:underline"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {showAddForm ? 'Cancelar' : 'Añadir Integrante'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAdd} className="p-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 space-y-3">
              <div className="text-xs font-semibold text-slate-800">Nuevo integrante del hogar:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  required
                  placeholder="Nombre y Apellido"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                >
                  <option value="Roommate">Roommate / Compañero</option>
                  <option value="Administrador">Administrador</option>
                  <option value="Pareja">Pareja</option>
                  <option value="Hijo/a">Hijo/a</option>
                  <option value="Familiar">Familiar</option>
                </select>
                <input
                  type="email"
                  placeholder="Email de contacto"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-sky-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700"
                >
                  Guardar Integrante
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {balances.map(({ member, totalPaid, totalOwed, netBalance }) => (
              <div
                key={member.id}
                className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border"
                    style={{
                      backgroundColor: `${member.color}15`,
                      color: member.color,
                      borderColor: `${member.color}40`,
                    }}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                      {member.name}
                      {member.role.includes('Admin') && (
                        <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{member.role}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Balance neto</div>
                  <div
                    className={`text-sm font-bold font-mono-numbers ${
                      netBalance > 0
                        ? 'text-emerald-600'
                        : netBalance < 0
                        ? 'text-rose-600'
                        : 'text-slate-600'
                    }`}
                  >
                    {netBalance > 0 ? `+${formatCurrency(netBalance)}` : formatCurrency(netBalance)}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {netBalance > 0 ? 'a favor' : netBalance < 0 ? 'por aportar' : 'al día'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Co-living tips for harmonious household */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Reglas de Oro del Hogar
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            1. <strong>Facturas:</strong> Se cargan con fecha límite visible para todos. Quien realiza el pago se anota en 1 clic y el saldo se equilibra automáticamente.
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            2. <strong>Tareas Domésticas:</strong> Utiliza el botón de &quot;Rotar Tareas&quot; cada semana para distribuir equitativamente las tareas menos agradables (baños, basura, campana).
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            3. <strong>Mantenimiento Preventivo:</strong> Revisar filtros y calderas a tiempo ahorra hasta un 30% de energía y previene reparaciones de urgencia de cientos de euros.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Entendido y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
