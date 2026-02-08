
import React, { useState } from 'react';
import { Sale, Client } from '../types';
import { printerService } from '../services/printerService';

interface TicketModalProps {
  sale: Sale;
  client?: Client;
  onClose: () => void;
}

const TicketModal: React.FC<TicketModalProps> = ({ sale, client, onClose }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintBT = async () => {
    setIsPrinting(true);
    try {
      const formatted = printerService.formatTicket(sale, client);
      await printerService.printTicket(formatted);
    } catch (e) {
      alert("No se pudo conectar con la impresora Bluetooth. Asegúrate de que esté encendida y sea vinculable.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintSystem = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 z-[110] no-print">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden flex flex-col max-h-[95vh] shadow-2xl">
        
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-700">Comprobante de Venta</h3>
          <button onClick={onClose} className="text-gray-400 p-2">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white flex flex-col items-center">
          {/* Vista previa del ticket físico */}
          <div id="ticket-area" className="bg-white p-4 w-full font-mono text-[12px] leading-tight text-black border-2 border-dashed border-gray-200">
            <div className="text-center mb-4 border-b border-black pb-2">
              <h1 className="font-bold text-base uppercase">Venta Pro</h1>
              <p className="text-[10px]">Puerta a Puerta</p>
              <p className="mt-1">{sale.fecha ? new Date(sale.fecha).toLocaleString() : ''}</p>
            </div>
            
            <div className="mb-4 space-y-1 text-[11px]">
              <p>ID: <span className="font-bold">{sale.id}</span></p>
              <p>Cliente: <span className="font-bold">{sale.clientNombre}</span></p>
              {client?.direccion && <p>Dir: {client.direccion}</p>}
            </div>

            <table className="w-full mb-4 border-t border-black">
              <thead>
                <tr className="text-left border-b border-black">
                  <th className="py-1 font-bold">Cant</th>
                  <th className="py-1 font-bold">Item</th>
                  <th className="py-1 font-bold text-right">Sub</th>
                </tr>
              </thead>
              <tbody>
                {(sale.items || []).map(item => (
                  <tr key={item.productId} className="border-b border-gray-100">
                    <td className="py-1">{item.cantidad}</td>
                    <td className="py-1">{item.nombre.substring(0, 15)}</td>
                    <td className="py-1 text-right">${(item.subtotal || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-right pt-2">
              <p className="font-bold text-lg">TOTAL: ${(sale.total || 0).toLocaleString()}</p>
            </div>

            <div className="mt-6 text-center text-[10px] border-t border-black pt-2 uppercase font-bold">
              ¡Gracias por su compra!
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t space-y-3">
          <button 
            onClick={handlePrintBT}
            disabled={isPrinting}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 disabled:opacity-50"
          >
            {isPrinting ? '⏳ Conectando...' : '🔵 Imprimir Directo (Bluetooth)'}
          </button>
          
          <button 
            onClick={handlePrintSystem}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            📶 Imprimir WiFi / Red
          </button>

          <button 
            onClick={() => {
              const text = printerService.formatTicket(sale, client);
              window.open(`https://wa.me/${client?.telefono?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`);
            }}
            className="w-full bg-green-500 text-white py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            📱 Enviar por WhatsApp
          </button>
        </div>
      </div>
      
      <style>
        {`
          @media print {
            body { background: white !important; }
            .no-print { display: none !important; }
            #ticket-area { 
              position: fixed;
              top: 0;
              left: 0;
              width: 58mm; /* Ancho estándar de ticket */
              padding: 0;
              margin: 0;
              border: none;
              font-family: 'Courier New', Courier, monospace;
            }
            @page {
              size: 58mm auto;
              margin: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default TicketModal;
