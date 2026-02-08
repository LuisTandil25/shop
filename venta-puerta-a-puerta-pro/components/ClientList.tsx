
import React, { useState } from 'react';
import { Client } from '../types';

interface ClientListProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onSyncClients: () => void;
  isLoading: boolean;
  isOnline: boolean;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onAddClient, onSyncClients, isLoading, isOnline }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', telefono: '', direccion: '' });

  const pendingCount = clients.filter(c => c.estado === 'pendiente').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient({ 
      id: `CLI-${Date.now()}`, 
      ...formData,
      estado: 'pendiente'
    });
    setIsAdding(false);
    setFormData({ nombre: '', telefono: '', direccion: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Clientes</h2>
          <p className="text-gray-500">{clients.length} contactos registrados</p>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <button 
              onClick={onSyncClients}
              disabled={isLoading || !isOnline}
              className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md flex items-center gap-2 ${
                !isOnline ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isLoading ? '...' : `Sincronizar (${pendingCount})`}
            </button>
          )}
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-blue-700"
          >
            {isAdding ? 'Cerrar' : '+ Nuevo'}
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre Completo</label>
              <input required placeholder="Ej: Juan Perez" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">WhatsApp / Tel</label>
              <input required placeholder="Ej: 1122334455" value={formData.telefono} onChange={e => setFormData({...formData, telefono: e.target.value})} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Dirección de Entrega</label>
              <input required placeholder="Ej: Calle Falsa 123" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100">Registrar Cliente</button>
        </form>
      )}

      <div className="grid grid-cols-1 gap-3">
        {clients.sort((a,b) => (a.estado === 'pendiente' ? -1 : 1)).map(c => (
          <div key={c.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm hover:border-blue-100 transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-gray-800">{c.nombre}</h4>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase ${
                  c.estado === 'sincronizado' ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500'
                }`}>
                  {c.estado === 'sincronizado' ? '✓ Nube' : '⏳ Local'}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <span className="opacity-50">📍</span> {c.direccion}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={`https://wa.me/${c.telefono.replace(/\D/g, '')}`} 
                target="_blank" 
                rel="noreferrer"
                className="bg-green-50 text-green-600 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-green-600 hover:text-white transition-all"
              >
                📱
              </a>
            </div>
          </div>
        ))}
        {clients.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-4xl mb-4">👥</p>
            <p className="text-gray-400 font-medium">Aún no has registrado clientes.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientList;
