
import React, { useState, useEffect, useCallback } from 'react';
import { View, Product, Client, Sale } from './types';
import { GoogleSheetsService } from './services/googleSheetsService';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import ClientList from './components/ClientList';
import SaleForm from './components/SaleForm';
import History from './components/History';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Carga inmediata desde localStorage
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('local_products');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('local_clients');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('local_sales');
    return saved ? JSON.parse(saved) : [];
  });

  const [sheetUrl, setSheetUrl] = useState<string>(localStorage.getItem('sheet_url') || '');
  const [isLoading, setIsLoading] = useState(false);

  const sheetsService = new GoogleSheetsService(sheetUrl);

  // Monitor de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronizar cambios de estado con localStorage
  useEffect(() => {
    localStorage.setItem('local_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('local_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('local_sales', JSON.stringify(sales));
  }, [sales]);

  const loadRemoteProducts = useCallback(async () => {
    if (!isOnline) {
      alert('Necesitas conexión a internet para descargar nuevos productos.');
      return;
    }
    if (!sheetUrl) {
      alert('Configura la URL de Google Sheets en Ajustes primero.');
      return;
    }
    setIsLoading(true);
    try {
      const data = await sheetsService.fetchProducts();
      if (data && data.length > 0) {
        setProducts(data);
        alert('Catálogo actualizado y guardado localmente.');
      } else {
        alert('No se recibieron productos. Verifica tu script de Google.');
      }
    } catch (e) {
      alert('Error al conectar con Google Sheets.');
    } finally {
      setIsLoading(false);
    }
  }, [sheetUrl, isOnline]);

  const addClient = async (client: Client) => {
    // Primero guardamos localmente como pendiente
    const newClient: Client = { ...client, estado: 'pendiente' };
    setClients(prev => [...prev, newClient]);
    
    // Si hay internet, intentamos sincronizar inmediatamente
    if (isOnline && sheetUrl) {
      const success = await sheetsService.syncClients([newClient]);
      if (success) {
        setClients(prev => prev.map(c => c.id === newClient.id ? { ...c, estado: 'sincronizado' } : c));
      }
    }
  };

  const addSale = (sale: Sale) => {
    setSales(prev => [...prev, { ...sale, estado: 'pendiente' }]);
  };

  const syncAllClients = async () => {
    if (!isOnline) {
      alert('No hay conexión a internet.');
      return;
    }
    const pendingClients = clients.filter(c => c.estado === 'pendiente');
    if (pendingClients.length === 0) return;

    setIsLoading(true);
    const success = await sheetsService.syncClients(pendingClients);
    if (success) {
      setClients(prev => prev.map(c => ({ ...c, estado: 'sincronizado' })));
      alert('Clientes sincronizados correctamente.');
    } else {
      alert('Error al sincronizar clientes.');
    }
    setIsLoading(false);
  };

  const syncAllSales = async () => {
    if (!isOnline) {
      alert('No hay conexión a internet.');
      return;
    }
    const pendingSales = sales.filter(s => s.estado === 'pendiente');
    if (pendingSales.length === 0) return;

    setIsLoading(true);
    const success = await sheetsService.syncSales(pendingSales);
    if (success) {
      setSales(prev => prev.map(s => ({ ...s, estado: 'sincronizado' })));
      alert('¡Ventas sincronizadas con éxito!');
    } else {
      alert('Error al sincronizar ventas.');
    }
    setIsLoading(false);
  };

  const renderView = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return <Dashboard sales={sales} clients={clients} onNavigate={setCurrentView} isOnline={isOnline} />;
      case View.PRODUCTS:
        return <ProductList products={products} onRefresh={loadRemoteProducts} isLoading={isLoading} />;
      case View.CLIENTS:
        return <ClientList clients={clients} onAddClient={addClient} onSyncClients={syncAllClients} isLoading={isLoading} isOnline={isOnline} />;
      case View.NEW_SALE:
        return <SaleForm products={products} clients={clients} onAddSale={addSale} onAddClient={addClient} />;
      case View.HISTORY:
        return <History sales={sales} onSync={syncAllSales} isLoading={isLoading} isOnline={isOnline} />;
      case View.SETTINGS:
        return <Settings url={sheetUrl} onSaveUrl={(u) => { setSheetUrl(u); localStorage.setItem('sheet_url', u); }} />;
      default:
        return <Dashboard sales={sales} clients={clients} onNavigate={setCurrentView} isOnline={isOnline} />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-4xl mx-auto">
          {!isOnline && (
            <div className="mb-4 bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-3 rounded-r-xl text-xs font-bold animate-pulse">
              ⚠️ MODO OFFLINE: Trabajando localmente. Clientes y ventas se sincronizarán al recuperar conexión.
            </div>
          )}
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
