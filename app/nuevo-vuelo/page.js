'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

function sanitizeSupabaseUrl(url) {
  if (!url) return '';
  let cleaned = url.trim().replace(/^["']|["']$/g, '');
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://' + cleaned;
  }
  try {
    const parsed = new URL(cleaned);
    return parsed.origin;
  } catch (e) {
    return cleaned;
  }
}

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim().replace(/^["']|["']$/g, '');

const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey);

export default function NuevoVueloPage() {
  const [aeronaves, setAeronaves] = useState([]);
  const [vuelos, setVuelos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    aeronave_id: '',
    fecha: new Date().toISOString().split('T')[0],
    horas_vuelo: '',
    observaciones: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Cargar aeronaves
      const { data: aeroData, error: aeroErr } = await supabase
        .from('aeronaves')
        .select('*')
        .order('id', { ascending: true });

      if (aeroErr) {
        setErrorMsg(`Error al cargar aeronaves: ${aeroErr.message}`);
      } else if (aeroData) {
        setAeronaves(aeroData);
        if (aeroData.length > 0) {
          setFormData((prev) => ({ ...prev, aeronave_id: aeroData[0].id }));
        }
      }

      // 2. Cargar historial de vuelos
      const { data: vueloData, error: vueloErr } = await supabase
        .from('vuelos')
        .select('*, aeronaves(matricula)')
        .order('id', { ascending: false });

      if (!vueloErr && vueloData) {
        setVuelos(vueloData);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setErrorMsg('Ocurrió un error al conectar con Supabase.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const horas = Number(formData.horas_vuelo) || 0;

    if (!formData.aeronave_id) {
      setErrorMsg('Debes seleccionar una aeronave válida.');
      setSubmitting(false);
      return;
    }

    // 1. Guardar el vuelo en la tabla 'vuelos'
    const { error: insertError } = await supabase
      .from('vuelos')
      .insert([
        {
          aeronave_id: formData.aeronave_id,
          fecha: formData.fecha,
          horas_vuelo: horas,
          observaciones: formData.observaciones.trim()
        }
      ]);

    if (insertError) {
      setErrorMsg(`Error al guardar vuelo: ${insertError.message}`);
      setSubmitting(false);
      return;
    }

    // 2. Sumar las horas de vuelo a la aeronave
    const aeronaveSeleccionada = aeronaves.find(a => String(a.id) === String(formData.aeronave_id));
    if (aeronaveSeleccionada) {
      const nuevasHorasTotales = (Number(aeronaveSeleccionada.horas_vuelo) || 0) + horas;
      
      await supabase
        .from('aeronaves')
        .update({ horas_vuelo: nuevasHorasTotales })
        .eq('id', formData.aeronave_id);
    }

    setSuccessMsg('¡Vuelo registrado con éxito y horas actualizadas!');

    // Limpiar formulario
    setFormData({
      aeronave_id: aeronaves.length > 0 ? aeronaves[0].id : '',
      fecha: new Date().toISOString().split('T')[0],
      horas_vuelo: '',
      observaciones: ''
    });

    await cargarDatos();
    setSubmitting(false);
  };

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Registro de Vuelos</h1>
        <a
          href="/aeronaves"
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded text-sm transition duration-200"
        >
          ← Volver a Flota
        </a>
      </div>

      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Aviso: </strong>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <span>{successMsg}</span>
        </div>
      )}

      {/* Formulario de Registro */}
      <section className="bg-white p-6 rounded-lg shadow-md border mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Nuevo Vuelo</h2>

        {loading ? (
          <p className="text-gray-500">Cargando flota...</p>
        ) : aeronaves.length === 0 ? (
          <div className="bg-amber-50 border border-amber-300 p-4 rounded text-amber-800">
            <p className="font-semibold mb-1">No hay aeronaves disponibles.</p>
            <p className="text-sm mb-3">Registra primero una aeronave en la sección de flota.</p>
            <a
              href="/aeronaves"
              className="inline-block bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2 px-3 rounded"
            >
              + Ir a Registrar Aeronave
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aeronave (Matrícula)</label>
              <select
                name="aeronave_id"
                value={formData.aeronave_id}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black bg-white"
              >
                {aeronaves.map((aero) => (
                  <option key={aero.id} value={aero.id}>
                    {aero.matricula} ({aero.horas_vuelo || 0} hrs totales)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horas de Vuelo</label>
              <input
                type="number"
                step="0.1"
                name="horas_vuelo"
                placeholder="Ej: 2.5"
                value={formData.horas_vuelo}
                onChange={handleChange}
                required
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <textarea
                name="observaciones"
                rows="2"
                placeholder="Notas sobre el vuelo (opcional)..."
                value={formData.observaciones}
                onChange={handleChange}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black"
              ></textarea>
            </div>

            <div className="md:col-span-3">
              <button
                type="submit"
                disabled={submitting || aeronaves.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
              >
                {submitting ? 'Guardando...' : 'Registrar Vuelo'}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Historial de Vuelos */}
      <section className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Historial de Vuelos</h2>
        {vuelos.length === 0 ? (
          <p className="text-gray-500">No hay vuelos registrados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3 font-semibold text-gray-700">Fecha</th>
                  <th className="p-3 font-semibold text-gray-700">Aeronave</th>
                  <th className="p-3 font-semibold text-gray-700">Horas de Vuelo</th>
                  <th className="p-3 font-semibold text-gray-700">Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {vuelos.map((vuelo) => (
                  <tr key={vuelo.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-800">{vuelo.fecha}</td>
                    <td className="p-3 font-bold text-gray-900">
                      {vuelo.aeronaves?.matricula || `ID: ${vuelo.aeronave_id}`}
                    </td>
                    <td className="p-3 text-gray-800">{vuelo.horas_vuelo} hrs</td>
                    <td className="p-3 text-gray-600">{vuelo.observaciones || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}