
import React, { useState } from 'react';

interface SettingsProps {
  url: string;
  onSaveUrl: (url: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ url, onSaveUrl }) => {
  const [inputUrl, setInputUrl] = useState(url);

  const handleOpenPWABuilder = () => {
    window.open('https://www.pwabuilder.com/', '_blank');
  };

  const handleClearCache = async () => {
    if (confirm('¿Quieres limpiar la caché y forzar la actualización? La app se reiniciará.')) {
      const cacheKeys = await caches.keys();
      await Promise.all(cacheKeys.map(key => caches.delete(key)));
      
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (let registration of registrations) {
          await registration.unregister();
        }
      }
      
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <header>
        <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
        <p className="text-gray-500">Gestión de datos y generación de aplicación nativa</p>
      </header>

      {/* Sección de Google Sheets */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <span className="bg-green-100 p-2 rounded-xl text-lg">📊</span> Sincronización con Sheets
        </h3>
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">URL de Implementación (Apps Script)</label>
          <input 
            type="text" 
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="https://script.google.com/macros/s/.../exec"
          />
        </div>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => {
              onSaveUrl(inputUrl);
              alert('Configuración guardada correctamente.');
            }}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
          >
            Guardar Cambios
          </button>
          <button 
            onClick={handleClearCache}
            className="w-full bg-red-50 text-red-600 py-3 rounded-2xl text-xs font-bold border border-red-100 hover:bg-red-100 transition-all"
          >
            ⚠️ Limpiar caché y Resetear App
          </button>
        </div>
      </div>

      {/* GUÍA PASO A PASO APK */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
          <h3 className="font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">🤖</span> ¿Cómo generar tu archivo APK?
          </h3>
          <p className="text-gray-400 text-xs mt-1 italic">Sigue estos pasos para convertir esta web en una app instalable.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Publica tu aplicación</p>
              <p className="text-xs text-gray-500 mt-1">Sube este código a Netlify y espera a que el despliegue termine.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Usa PWABuilder</p>
              <p className="text-xs text-gray-500 mt-1">Pega tu URL en pwabuilder.com. Si se queda pensando, cierra la pestaña y vuelve a intentar con la URL de Netlify recién actualizada.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">3</div>
            <div>
              <p className="font-bold text-gray-800 text-sm">Descarga y Genera</p>
              <p className="text-xs text-gray-500 mt-1">Haz clic en "Package for Store" en Android. Generarás un archivo APK listo para descargar.</p>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleOpenPWABuilder}
              className="w-full bg-gray-50 border-2 border-dashed border-gray-200 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              Abrir PWABuilder.com 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
