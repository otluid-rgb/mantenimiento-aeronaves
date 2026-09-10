'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AeronavesPage() {
  const [aeronaves, setAeronaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Estado del formulario (sin modelo)
  const [formData, setFormData] = useState({
    matricula: '',
    horas_vuelo: '',
    estado: 'Operativo'
  });

  useEffect(() => {
    fetchAeronaves();
  }, []);

  async function fetchAeronaves() {
    setLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase
      .from('aeronaves')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error al consultar Supabase:', error);
      setErrorMsg(`Error al leer datos: ${error.message}`);
    } else {
      setAeronaves(data || []);
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

    const payload = {
      matricula: formData.matricula.toUpperCase(),
      horas_vuelo: Number(formData.horas_vuelo) || 0,
      estado: formData.estado
    };

    const { error } = await supabase
      .from('aeronaves')
      .insert([payload]);

    if (error) {
      console.error('Error al insertar en Supabase:', error);
      setErrorMsg(`Error al guardar: ${error.message}`);
    } else {
      setFormData({ matricula: '', horas_vuelo: '', estado: 'Operativo' });
      fetchAeronaves();
    }
    setSubmitting(false);
  };

  return (
    <main className="max-w-4xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Gestión de Flota de Aeronaves
      </h1>

      {errorMsg && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong className="font-bold">Error de Supabase: </strong>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Formulario simplificado */}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Horas de Vuelo</label>
            <input
              type="number"
              name="horas_vuelo"
              placeholder="Ej: 150"
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
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="Operativo">Operativo</option>
              <option value="En Mantenimiento">En Mantenimiento</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
            >
              {submitting ? 'Guardando...' : 'Guardar Aeronave'}
            </button>
          </div>
        </form>
      </section>

      {/* Listado simplificado */}
      <section className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Flota Registrada</h2>
        {loading ? (
          <p className="text-gray-500">Cargando flota...</p>
        ) : aeronaves.length === 0 ? (
          <p className="text-gray-500">No hay aeronaves registradas en la base de datos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="p-3 font-semibold text-gray-700">Matrícula</th>
                  <th className="p-3 font-semibold text-gray-700">Horas</th>
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
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${
                          aero.estado === 'Operativo'
                            ? 'bg-green-100 text-green-800'
                            : aero.estado === 'En Mantenimiento'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {aero.estado}
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