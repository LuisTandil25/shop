
import React from 'react';
import { Sale, Client, View } from '../types';

interface DashboardProps {
  sales: Sale[];
  clients: Client[];
  onNavigate: (view: View) => void;
  isOnline: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ sales, clients, onNavigate, isOnline }) => {
  const totalVendido = sales.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const ventasHoy = sales.filter(s => {
    if (!s.fecha) return false;
    return new Date(s.fecha).toLocaleDateString() === new Date().toLocaleDateString();
  }).length;

  const pendingSales = sales.filter(s => s.estado === 'pendiente').length;
  const pendingClients = clients.filter(c => c.estado === 'pendiente').length;

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
          <p className="text-gray-500">Resumen de tu actividad de hoy</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
        }`}>
          {isOnline ? '● Online' : '○ Offline'}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase">Ventas Totales</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">${(totalVendido || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase">Ventas de Hoy</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{ventasHoy}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-sm font-medium text-gray-400 uppercase">Pendientes Sinc.</p>
          <div className="flex items-end gap-2 mt-1">
            <p className={`text-3xl font-bold ${pendingSales > 0 ? 'text-orange-500' : 'text-gray-800'}`}>
              {pendingSales} <span className="text-xs text-gray-400 font-normal">Ventas</span>
            </p>
            <p className={`text-3xl font-bold ${pendingClients > 0 ? 'text-blue-500' : 'text-gray-800'}`}>
              {pendingClients} <span className="text-xs text-gray-400 font-normal">Cli.</span>
            </p>
          </div>
        </div>
      </div>

      {(pendingSales > 0 || pendingClients > 0) && !isOnline && (
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center gap-3">
          <span className="text-xl">📡</span>
          <p className="text-xs text-orange-700 font-medium">
            Tienes datos guardados en el teléfono ({pendingSales} ventas y {pendingClients} clientes). Conéctate para sincronizar.
          </p>
        </div>
      )}

      <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">¿Nueva venta?</h3>
          <p className="text-blue-100 mb-6">Inicia una nueva transacción rápidamente, incluso sin internet.</p>
          <button 
            onClick={() => onNavigate(View.NEW_SALE)}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-colors"
          >
            Comenzar Venta
          </button>
        </div>
        <div className="absolute top-0 right-0 opacity-10 text-9xl -mr-10 -mt-10">💰</div>
      </div>
    </div>
  );
};

export default Dashboard;
