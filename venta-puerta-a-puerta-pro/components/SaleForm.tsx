
import React, { useState, useMemo } from 'react';
import { Product, Client, Sale, SaleItem } from '../types';
import TicketModal from './TicketModal';

interface SaleFormProps {
  products: Product[];
  clients: Client[];
  onAddSale: (sale: Sale) => void;
  onAddClient: (client: Client) => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ products, clients, onAddSale, onAddClient }) => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({ nombre: '', telefono: '', direccion: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSale, setActiveSale] = useState<Sale | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      (p.nombre || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const total = cart.reduce((acc, item) => acc + (item.subtotal || 0), 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id 
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * (item.precioUnitario || 0) }
          : item
        );
      }
      return [...prev, {
        productId: product.id,
        nombre: product.nombre,
        cantidad: 1,
        precioUnitario: product.precio || 0,
        subtotal: product.precio || 0
      }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleCreateSale = () => {
    if (!selectedClientId) {
      alert('Por favor selecciona un cliente');
      return;
    }
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    const client = clients.find(c => c.id === selectedClientId);
    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      clientId: selectedClientId,
      clientNombre: client?.nombre || 'Desconocido',
      items: cart,
      total: total,
      fecha: new Date().toISOString(),
      estado: 'pendiente'
    };

    onAddSale(sale);
    setActiveSale(sale);
    setCart([]);
    setSelectedClientId('');
    setSearchTerm('');
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `CLI-${Date.now()}`;
    const client = { id, ...newClient };
    onAddClient(client);
    setSelectedClientId(id);
    setIsClientModalOpen(false);
    setNewClient({ nombre: '', telefono: '', direccion: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Nueva Venta</h2>
        <button 
          onClick={() => setIsClientModalOpen(true)}
          className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm font-bold border border-blue-100"
        >
          + Nuevo Cliente
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Cliente</label>
        <select 
          value={selectedClientId}
          onChange={(e) => setSelectedClientId(e.target.value)}
          className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 font-medium"
        >
          <option value="">-- Elige un cliente --</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.nombre} ({c.direccion})</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar por nombre o SKU..."
              className="w-full p-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-4 top-4 text-gray-300">🔍</span>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredProducts.map(p => (
              <div key={p.id} className="bg-white p-3 rounded-2xl border border-gray-50 flex items-center gap-4 shadow-sm hover:border-blue-200 transition-all group">
                <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                  {p.imagen ? (
                    <img src={p.imagen} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">📦</div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight">{p.nombre}</h4>
                  <p className="text-xs text-gray-400">SKU: {p.sku || 'S/N'}</p>
                  <p className="text-sm text-blue-600 font-bold mt-1">${(p.precio || 0).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => addToCart(p)}
                  className="bg-gray-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold transition-all"
                >
                  +
                </button>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
                {products.length === 0 ? 'Catálogo vacío' : 'No hay resultados'}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex flex-col h-full sticky top-8">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-lg flex items-center justify-center">🛒</span> 
            Carrito de Compra
          </h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[350px] pr-2">
            {cart.map(item => (
              <div key={item.productId} className="flex justify-between items-center py-3 border-b border-gray-50">
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-sm">{item.nombre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">{item.cantidad} unidades</span>
                    <span className="text-xs text-gray-400">x ${(item.precioUnitario || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-gray-900">${(item.subtotal || 0).toLocaleString()}</span>
                  <button 
                    onClick={() => removeFromCart(item.productId)} 
                    className="text-red-400 hover:text-red-600 p-2"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">🛒</p>
                <p className="text-gray-400 text-sm">Agrega productos para comenzar</p>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-wider">Total a Pagar</span>
              <span className="text-3xl font-black text-blue-600">${(total || 0).toLocaleString()}</span>
            </div>
            <button 
              onClick={handleCreateSale}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 disabled:bg-gray-200 disabled:shadow-none"
              disabled={cart.length === 0}
            >
              Finalizar Venta
            </button>
          </div>
        </div>
      </div>

      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black mb-2 text-gray-800">Nuevo Cliente</h3>
            <p className="text-gray-500 text-sm mb-6">Completa los datos para registrar un nuevo comprador.</p>
            <form onSubmit={handleSaveClient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nombre</label>
                <input required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500" placeholder="Ej: Juan Perez" value={newClient.nombre} onChange={e => setNewClient({...newClient, nombre: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Teléfono</label>
                <input required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500" placeholder="Ej: 1122334455" value={newClient.telefono} onChange={e => setNewClient({...newClient, telefono: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase ml-1">Dirección</label>
                <input required className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500" placeholder="Ej: Av. Siempreviva 123" value={newClient.direccion} onChange={e => setNewClient({...newClient, direccion: e.target.value})} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeSale && (
        <TicketModal 
          sale={activeSale} 
          client={clients.find(c => c.id === activeSale.clientId)}
          onClose={() => setActiveSale(null)} 
        />
      )}
    </div>
  );
};

export default SaleForm;
