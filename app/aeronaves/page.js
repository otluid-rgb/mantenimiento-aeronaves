'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AeronavesPage() {
  const [aeronaves, setAeronaves] = useState([]);
  const [matricula, setMatricula] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const fetchAeronaves = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('aeronaves')
      .select('id, matricula, horas_totales, tomas_totales, arranques_totales')
      .order('matricula', { ascending: true });

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al cargar aeronaves: ' + error.message });
    } else {
      setAeronaves(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAeronaves();
  }, []);

  const handleCrearAeronave = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    // Validación estricta del formato de matrícula: T.12B-xx
    const regexMatricula = /^T\.12B-\d{2}$/;
    const matriculaLimpia = matricula.trim().toUpperCase();

    if (!regexMatricula.test(matriculaLimpia)) {
      setMensaje({
        tipo: 'error',
        texto: 'Formato de matrícula no válido. Debe coincidir con el patrón T.12B-xx (Ejemplo: T.12B-01).',
      });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('aeronaves')
      .insert([{ matricula: matriculaLimpia }]);

    if (error) {
      setMensaje({
        tipo: 'error',
        texto: error.code === '23505' ? 'Esa matrícula ya está registrada.' : error.message,
      });
    } else {
      setMensaje({ tipo: 'éxito', texto: `Aeronave ${matriculaLimpia} registrada exitosamente.` });
      setMatricula('');
      fetchAeronaves();
    }
    setSaving(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white">Flota de Aeronaves</h2>
        <p className="text-slate-400 text-sm">Listado general de unidades y registro de nuevas células.</p>
      </div>

      {mensaje.texto && (
        <div
          className={`p-4 rounded-lg font-medium text-sm ${
            mensaje.tipo === 'error'
              ? 'bg-rose-950/80 border border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-200'
          }`}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Formulario de Alta */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-sky-400">Registrar Nueva Aeronave</h3>
        <form onSubmit={handleCrearAeronave} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Matrícula
            </label>
            <input
              type="text"
              value={matricula}
              onChange={(e) => setMatricula(e.target.value)}
              placeholder="T.12B-01"
              maxLength={8}
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 uppercase font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-md disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Añadir Aeronave'}
          </button>
        </form>
      </div>

      {/* Tabla de Aeronaves */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-700">
          <h3 className="text-lg font-semibold text-slate-200">Aeronaves Activas</h3>
        </div>
        {loading ? (
          <p className="p-6 text-slate-400">Cargando flota...</p>
        ) : aeronaves.length === 0 ? (
          <p className="p-6 text-slate-400">No hay aeronaves registradas en la flota.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-slate-300 border-collapse">
              <thead className="bg-slate-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="px-6 py-3">Matrícula</th>
                  <th className="px-6 py-3">Horas Totales</th>
                  <th className="px-6 py-3">Tomas Totales</th>
                  <th className="px-6 py-3">Arranques Totales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-sm">
                {aeronaves.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-sky-400">{item.matricula}</td>
                    <td className="px-6 py-4 font-mono">{Number(item.horas_totales).toFixed(2)} h</td>
                    <td className="px-6 py-4 font-mono">{item.tomas_totales}</td>
                    <td className="px-6 py-4 font-mono">{item.arranques_totales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}