'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NuevoVueloPage() {
  const [aeronaves, setAeronaves] = useState([]);
  const [loadingAeronaves, setLoadingAeronaves] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const [form, setForm] = useState({
    aeronave_id: '',
    piloto_nombre: '',
    horas_vuelo: '',
    tomas: '',
    arranques: '',
    observaciones: '',
  });

  useEffect(() => {
    const fetchAeronaves = async () => {
      const { data, error } = await supabase
        .from('aeronaves')
        .select('id, matricula')
        .order('matricula', { ascending: true });

      if (!error && data) {
        setAeronaves(data);
      }
      setLoadingAeronaves(false);
    };

    fetchAeronaves();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    if (!form.aeronave_id) {
      setMensaje({ tipo: 'error', texto: 'Por favor, selecciona una aeronave.' });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from('registros_vuelo').insert([
      {
        aeronave_id: form.aeronave_id,
        piloto_nombre: form.piloto_nombre.trim(),
        horas_vuelo: parseFloat(form.horas_vuelo),
        tomas: parseInt(form.tomas, 10),
        arranques: parseInt(form.arranques, 10),
        observaciones: form.observaciones.trim() || null,
      },
    ]);

    if (error) {
      setMensaje({ tipo: 'error', texto: 'Error al registrar el vuelo: ' + error.message });
    } else {
      setMensaje({
        tipo: 'éxito',
        texto: 'Vuelo registrado exitosamente. Los acumulados de la célula y los componentes se han actualizado.',
      });
      setForm({
        aeronave_id: '',
        piloto_nombre: '',
        horas_vuelo: '',
        tomas: '',
        arranques: '',
        observaciones: '',
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Registrar Parte de Vuelo</h2>
        <p className="text-slate-400 text-sm">
          Introduce las horas, tomas y arranques realizados durante la misión.
        </p>
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

      <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Aeronave *
          </label>
          <select
            name="aeronave_id"
            value={form.aeronave_id}
            onChange={handleChange}
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
          >
            <option value="">
              {loadingAeronaves ? 'Cargando aeronaves...' : '-- Seleccionar Matrícula --'}
            </option>
            {aeronaves.map((aero) => (
              <option key={aero.id} value={aero.id}>
                {aero.matricula}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Piloto / Comandante *
          </label>
          <input
            type="text"
            name="piloto_nombre"
            value={form.piloto_nombre}
            onChange={handleChange}
            placeholder="Ej. Cap. C. Pérez"
            required
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Horas de Vuelo *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="horas_vuelo"
              value={form.horas_vuelo}
              onChange={handleChange}
              placeholder="2.50"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Tomas (Aterrizajes) *
            </label>
            <input
              type="number"
              min="0"
              name="tomas"
              value={form.tomas}
              onChange={handleChange}
              placeholder="3"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Arranques *
            </label>
            <input
              type="number"
              min="0"
              name="arranques"
              value={form.arranques}
              onChange={handleChange}
              placeholder="1"
              required
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            rows="3"
            value={form.observaciones}
            onChange={handleChange}
            placeholder="Escribe aquí novedades del vuelo o estado del material..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors shadow-lg disabled:opacity-50"
        >
          {submitting ? 'Procesando...' : 'Guardar Parte de Vuelo'}
        </button>
      </form>
    </div>
  );
}