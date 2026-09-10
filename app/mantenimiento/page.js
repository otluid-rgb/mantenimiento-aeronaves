'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function MantenimientoPage() {
  const [componentes, setComponentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVistaMantenimiento = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('vista_control_mantenimiento')
      .select('*')
      .order('porcentaje_potencial_restante', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setComponentes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVistaMantenimiento();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard de Control de Mantenimiento</h2>
          <p className="text-slate-400 text-sm">
            Supervisión del potencial restante por componente y alertas de vida útil.
          </p>
        </div>
        <button
          onClick={fetchVistaMantenimiento}
          className="bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2"
        >
          <span>🔄</span>
          <span>Refrescar Datos</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/50 text-rose-200 rounded-lg text-sm">
          Error al obtener datos de mantenimiento: {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400">Cargando estado de componentes...</div>
      ) : componentes.length === 0 ? (
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 text-center text-slate-400">
          No hay componentes activos registrados actualmente.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {componentes.map((comp) => {
            const porcentaje = Number(comp.porcentaje_potencial_restante);
            const esCritico = porcentaje <= 15;

            return (
              <div
                key={comp.componente_id}
                className={`bg-slate-800 rounded-xl border p-5 shadow-lg flex flex-col justify-between transition-all ${
                  esCritico ? 'border-rose-500/80 ring-1 ring-rose-500/40' : 'border-slate-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-slate-900 text-sky-400 font-mono font-bold text-xs px-2.5 py-1 rounded border border-slate-700">
                      {comp.matricula}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        esCritico
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      }`}
                    >
                      {esCritico ? 'CRÍTICO (<=15%)' : 'OK'}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-100">{comp.componente_nombre}</h3>
                  <p className="text-xs font-mono text-slate-400 mb-4">S/N: {comp.numero_serie}</p>

                  <div className="bg-slate-900/70 p-3 rounded-lg space-y-2 text-xs text-slate-300 font-mono mb-5 border border-slate-800">
                    <div className="flex justify-between">
                      <span>Horas:</span>
                      <span>
                        {comp.horas_actuales} / {comp.max_horas ?? 'N/A'} h
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tomas:</span>
                      <span>
                        {comp.tomas_actuales} / {comp.max_tomas ?? 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arranques:</span>
                      <span>
                        {comp.arranques_actuales} / {comp.max_arranques ?? 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-400">Potencial Limítrofe:</span>
                    <span className={esCritico ? 'text-rose-400' : 'text-emerald-400'}>
                      {porcentaje.toFixed(1)}%
                    </span>
                  </div>

                  {/* Barra de progreso coloreada en Verde (>15%) o Rojo (<=15%) */}
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        esCritico ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
