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

export default function AeronavesPage() {
  const [aeronaves, setAeronaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    matricula: '',
    horas_vuelo: '',
    estado: 'Operativa'
  });

  useEffect(() => {
    cargarAeronaves();
  }, []);

  async function cargarAeronaves() {
    setLoading(true);
    setErrorMsg(null);

    // Consulta limpia a la tabla 'aeronaves'
    const { data, error } = await supabase
      .from('aeronaves')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      setErrorMsg(`Error al cargar aeronaves: ${error.message}`);
    } else if (data) {
      setAeronaves(data);
    }
    setLoading(false);
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

    const horas = Number(formData.horas_vuelo) || 0;

    // Insertar sin la columna modelo
    const { error } = await supabase
      .from('aeronaves')
      .insert([
        {
          matricula: formData.matricula.trim().toUpperCase(),
          horas_vuelo: horas,
          estado: formData.estado
        }
      ]);

    if (error) {
      setErrorMsg(`Error al registrar aeronave: ${error.message}`);
      setSubmitting(false);
      return;
    }

    setFormData({
      matricula: '',
      horas_vuelo: '',
      estado: 'Operativa'
    });

    await cargarAeronaves();
    setSubmitting(false);
  };

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Aeronaves</h1>
        <a
          href="/nuevo-vuelo"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded text-sm transition duration-200"
        >
          + Registrar Vuelo
        </a>
      </div>

      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Aviso: </strong>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Formulario para registrar aeronaves */}
      <section className="bg-white p-6 rounded-lg shadow-md border mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Registrar Nueva Aeronave</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
            <input
              type="text"
              name="matricula"
              placeholder="Ej: T.12B-01"
              value={formData.matricula}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Horas de Vuelo Iniciales</label>
            <input
              type="number"
              step="0.1"
              name="horas_vuelo"
              placeholder="Ej: 120.0"
              value={formData.horas_vuelo}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black bg-white"
            >
              <option value="Operativa">Operativa</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="Inactiva">Inactiva</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Registrar Aeronave'}
            </button>
          </div>
        </form>
      </section>

      {/* Tabla de Aeronaves */}
      <section className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Aeronaves Registradas</h2>
        {loading ? (
          <p className="text-gray-500">Cargando aeronaves...</p>
        ) : aeronaves.length === 0 ? (
          <p className="text-gray-500">No hay aeronaves registradas aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3 font-semibold text-gray-700">Matrícula</th>
                  <th className="p-3 font-semibold text-gray-700">Horas Totales</th>
                  <th className="p-3 font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {aeronaves.map((aero) => (
                  <tr key={aero.id || aero.matricula} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{aero.matricula}</td>
                    <td className="p-3 text-gray-800">{aero.horas_vuelo} hrs</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          aero.estado === 'Operativa'
                            ? 'bg-green-100 text-green-800'
                            : aero.estado === 'En Mantenimiento'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {aero.estado || 'Operativa'}
                      </span>
                    </td>
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