import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'Mantenimiento de Flota de Aeronaves',
  description: 'Control de horas de vuelo, aterrizajes y potencial restante de componentes',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans antialiased">
        <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✈️</span>
              <div>
                <h1 className="text-lg font-bold tracking-wider text-sky-400 leading-none">AERO-MAINT</h1>
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Control de Mantenimiento</p>
              </div>
            </div>
            <nav className="flex space-x-6 text-sm font-semibold mt-2 sm:mt-0">
              <Link href="/aeronaves" className="hover:text-sky-400 transition-colors">
                Flota
              </Link>
              <Link href="/nuevo-vuelo" className="hover:text-sky-400 transition-colors">
                Registrar Vuelo
              </Link>
              <Link href="/mantenimiento" className="hover:text-sky-400 transition-colors">
                Mantenimiento
              </Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">{children}</main>
      </body>
    </html>
  );
}