
import React from 'react';
import { Sale } from '../types';

interface HistoryProps {
  sales: Sale[];
  onSync: () => void;
  isLoading: boolean;
  isOnline: boolean;
}

const History: React.FC<HistoryProps> = ({ sales, onSync, isLoading, isOnline }) => {
  const pendingCount = sales.filter(s => s.estado === 'pendiente').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Historial de Ventas</h2>
          <p className="text-gray-500">{sales.length} ventas registradas localmente</p>
        </div>
        {pendingCount > 0 && (
          <button 
            onClick={onSync}
            disabled={isLoading || !isOnline}
            className={`px-4 py-2 rounded-lg font-bold shadow-md transition-colors flex items-center gap-2 ${
              !isOnline 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isLoading ? 'Sincronizando...' : !isOnline ? 'Sin conexión para subir' : `Sincronizar (${pendingCount})`}
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sales.sort((a, b) => {
                const dateA = a.fecha ? new Date(a.fecha).getTime() : 0;
                const dateB = b.fecha ? new Date(b.fecha).getTime() : 0;
                return dateB - dateA;
              }).map(sale => (
                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {sale.fecha ? new Date(sale.fecha).toLocaleString() : 'S/Fecha'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {sale.clientNombre || 'Sin cliente'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">
                    ${(sale.total || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      sale.estado === 'sincronizado' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {sale.estado || 'pendiente'}
                    </span>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    No has realizado ninguna venta todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
