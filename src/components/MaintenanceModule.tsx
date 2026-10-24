import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Phone, 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Trash2, 
  History, 
  HelpCircle,
  FileText
} from 'lucide-react';
import { MaintenanceItem, MaintenanceCategory } from '../types/household';
import { 
  formatCurrency, 
  formatDateSpanish, 
  getDaysDifference, 
  getDueStatusText 
} from '../utils/householdUtils';

interface MaintenanceModuleProps {
  maintenanceItems: MaintenanceItem[];
  onOpenNewMaintenance: () => void;
  onEditMaintenance: (item: MaintenanceItem) => void;
  onDeleteMaintenance: (itemId: string) => void;
  onOpenLogServiceModal: (item: MaintenanceItem) => void;
}

const CATEGORY_NAMES: Record<MaintenanceCategory, string> = {
  climatizacion: 'Climatización y Filtros',
  fontaneria: 'Fontanería y Caldera',
  electricidad: 'Electricidad y Red',
  electrodomesticos: 'Electrodomésticos',
  seguridad: 'Seguridad y Extintores',
  estructural: 'Estructural y Aislamiento',
  jardineria: 'Jardín y Terrazas',
};

export const MaintenanceModule: React.FC<MaintenanceModuleProps> = ({
  maintenanceItems,
  onOpenNewMaintenance,
  onEditMaintenance,
  onDeleteMaintenance,
  onOpenLogServiceModal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Filter items
  const filteredItems = maintenanceItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  // Calculate status counts
  const overdueCount = maintenanceItems.filter((i) => getDaysDifference(i.nextDueDate) < 0).length;
  const upcomingCount = maintenanceItems.filter((i) => {
    const d = getDaysDifference(i.nextDueDate);
    return d >= 0 && d <= 14;
  }).length;
  const onTrackCount = maintenanceItems.length - overdueCount - upcomingCount;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Calendario y Registro de Mantenimiento Preventivo
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Programa revisiones técnicas periódicas para alargar la vida de tus electrodomésticos, ahorrar energía y evitar averías costosas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewMaintenance}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Nuevo Mantenimiento
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div>
            <div className="text-xs text-slate-400 font-medium">Sistemas Monitoreados</div>
            <div className="text-xl font-bold font-mono-numbers text-slate-900 mt-0.5">
              {maintenanceItems.length}
            </div>
            <div className="text-[11px] text-slate-500">Equipos y revisiones activas</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Al Día</div>
            <div className="text-xl font-bold font-mono-numbers text-emerald-600 mt-0.5">
              {onTrackCount}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium">Con fecha vigente</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Próximos (menos de 15 días)</div>
            <div className="text-xl font-bold font-mono-numbers text-amber-600 mt-0.5">
              {upcomingCount}
            </div>
            <div className="text-[11px] text-slate-500">Requieren atención pronto</div>
          </div>

          <div>
            <div className="text-xs text-slate-400 font-medium">Urgentes / Vencidos</div>
            <div className={`text-xl font-bold font-mono-numbers mt-0.5 ${
              overdueCount > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}>
              {overdueCount}
            </div>
            <div className={`text-[11px] ${
              overdueCount > 0 ? 'text-rose-600 font-semibold' : 'text-slate-500'
            }`}>
              {overdueCount > 0 ? 'Revisión técnica retrasada' : 'Sin retrasos'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Category */}
      <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Todas las áreas ({maintenanceItems.length})
        </button>
        {Object.entries(CATEGORY_NAMES).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedCategory === key
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Maintenance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
            <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-sm font-semibold text-slate-800">No hay elementos en esta categoría</div>
            <div className="text-xs text-slate-500 mt-1">
              Agrega un nuevo programa de mantenimiento con el botón superior.
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            const statusInfo = getDueStatusText(item.nextDueDate);
            const isExpanded = expandedItemId === item.id;

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-xl p-4.5 transition-all shadow-xs flex flex-col justify-between ${
                  statusInfo.past
                    ? 'border-rose-300'
                    : statusInfo.urgent
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500">
                          {CATEGORY_NAMES[item.category] || item.category}
                        </span>
                        <span aria-hidden="true" className="text-slate-300">·</span>
                        <span className="text-xs text-slate-500">
                          Cada {item.frequencyMonths} {item.frequencyMonths === 1 ? 'mes' : 'meses'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onEditMaintenance(item)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                        title="Editar programa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteMaintenance(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Eliminar programa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {item.notes}
                    </p>
                  )}

                  {/* Dates & Cost strip */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px]">Última revisión:</div>
                      <div className="font-medium text-slate-700">
                        {formatDateSpanish(item.lastServiceDate)}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 text-[11px]">Próxima revisión:</div>
                      <div className={`font-semibold ${
                        statusInfo.past
                          ? 'text-rose-600'
                          : statusInfo.urgent
                          ? 'text-amber-600'
                          : 'text-slate-900'
                      }`}>
                        {formatDateSpanish(item.nextDueDate)} ({statusInfo.text})
                      </div>
                    </div>
                  </div>

                  {/* Provider & contact if present */}
                  {(item.providerName || item.providerPhone || item.estimatedCost !== undefined) && (
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                      <div className="truncate max-w-[200px]">
                        {item.providerName && <span>{item.providerName}</span>}
                        {item.providerPhone && (
                          <span className="font-mono-numbers ml-1.5 text-slate-700">
                            ({item.providerPhone})
                          </span>
                        )}
                      </div>
                      {item.estimatedCost !== undefined && (
                        <span className="font-mono-numbers font-medium text-slate-700">
                          {item.estimatedCost === 0 ? 'Bricolaje (0€)' : `~${formatCurrency(item.estimatedCost)}`}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Step by step guide if expanded */}
                  {isExpanded && item.stepsInstructions && item.stepsInstructions.length > 0 && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1.5 animate-in fade-in duration-100">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        Guía de ejecución recomendada:
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                        {item.stepsInstructions.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Service logs if expanded */}
                  {isExpanded && item.logs.length > 0 && (
                    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <History className="w-3.5 h-3.5 text-slate-600" />
                        Historial de servicios realizados:
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {item.logs.map((log, idx) => (
                          <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                            <div className="flex items-center justify-between font-semibold text-slate-800">
                              <span>{formatDateSpanish(log.date)}</span>
                              {log.cost !== undefined && (
                                <span className="font-mono-numbers text-slate-600">{formatCurrency(log.cost)}</span>
                              )}
                            </div>
                            <div className="text-slate-600 mt-0.5">{log.notes}</div>
                            {log.technician && (
                              <div className="text-slate-400 mt-0.5">Técnico: {log.technician}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="text-xs font-medium text-slate-500 hover:text-slate-900 flex items-center gap-1"
                  >
                    {isExpanded ? (
                      <>
                        Menos detalles <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        Ver guía e historial ({item.logs.length}) <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => onOpenLogServiceModal(item)}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Registrar Hecho
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
