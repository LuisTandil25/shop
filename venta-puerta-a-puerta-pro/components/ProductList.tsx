
import React from 'react';
import { Product } from '../types';

interface ProductListProps {
  products: Product[];
  onRefresh: () => void;
  isLoading: boolean;
}

const ProductList: React.FC<ProductListProps> = ({ products, onRefresh, isLoading }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Catálogo</h2>
          <p className="text-gray-500">{products.length} productos sincronizados</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className={`bg-white border px-4 py-2 rounded-xl hover:bg-gray-50 shadow-sm flex items-center gap-2 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="animate-spin">⌛</span>
          ) : (
            <span>🔄 Actualizar</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map(p => (
          <div key={p.sku || p.id} className="bg-white rounded-2xl border border-gray-100 flex overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="w-32 h-auto bg-gray-50 flex-shrink-0 relative">
              {p.imagen ? (
                <img 
                  src={p.imagen} 
                  alt={p.nombre} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=📦';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">📦</div>
              )}
            </div>
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-800 leading-tight">{p.nombre || 'Sin nombre'}</h3>
                <span className="text-xs font-mono text-gray-400">#{p.sku || 'S/SKU'}</span>
              </div>
              <p className="text-xs text-blue-500 font-semibold uppercase mt-1">{p.categoria || 'General'}</p>
              <p className="text-sm text-gray-500 mt-2 line-clamp-2">{p.descripcion || 'Sin descripción'}</p>
              
              <div className="flex justify-between items-end mt-4">
                <span className="text-lg font-bold text-green-600">${(p.precio || 0).toLocaleString()}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${(p.stock || 0) > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  STOCK: {p.stock || 0}
                </span>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && !isLoading && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No hay productos para mostrar.</p>
            <p className="text-xs text-gray-400 mt-1">Configura tu URL de Google Sheets en la pestaña de Configuración.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
