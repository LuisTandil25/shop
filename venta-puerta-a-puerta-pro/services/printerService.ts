
export class PrinterService {
  // Fix: Use any because Web Bluetooth types are not part of the standard TypeScript lib
  private device: any | null = null;
  // Fix: Use any because Web Bluetooth types are not part of the standard TypeScript lib
  private characteristic: any | null = null;

  // Comandos ESC/POS básicos
  private ESC = '\u001B';
  private GS = '\u001D';
  private INIT = '\u001B@';
  private BOLD_ON = '\u001BE\u0001';
  private BOLD_OFF = '\u001BE\u0000';
  private CENTER = '\u001Ba\u0001';
  private LEFT = '\u001Ba\u0000';

  async connect() {
    try {
      // Fix: Cast navigator to any to access the bluetooth property which is not in the standard Navigator type
      this.device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { services: ['000018f0-0000-1000-8000-00805f9b34fb'] }, // Servicio genérico de impresoras
          { namePrefix: 'TP' }, // Nombres comunes como TP2, TP3
          { namePrefix: 'MPT' },
          { namePrefix: 'Inner' }
        ],
        optionalServices: ['000018f0-0000-1000-8000-00805f9b34fb']
      });

      const server = await this.device.gatt?.connect();
      const service = await server?.getPrimaryService('000018f0-0000-1000-8000-00805f9b34fb');
      const characteristics = await service?.getCharacteristics();
      
      // Buscamos la característica de escritura
      this.characteristic = characteristics?.find((c: any) => c.properties.write || c.properties.writeWithoutResponse) || null;
      
      return true;
    } catch (error) {
      console.error('Error conectando a impresora:', error);
      return false;
    }
  }

  async printTicket(content: string) {
    if (!this.characteristic) {
      const connected = await this.connect();
      if (!connected) return;
    }

    // Convertimos el string a Uint8Array (ASCII aproximado)
    const encoder = new TextEncoder();
    const data = encoder.encode(this.INIT + content + '\n\n\n\n');
    
    // Las impresoras térmicas suelen tener un límite de buffer, enviamos en trozos
    const chunkSize = 20;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await this.characteristic?.writeValue(chunk);
    }
  }

  formatTicket(sale: any, client: any): string {
    let t = this.CENTER + this.BOLD_ON + "VENTA PRO\n" + this.BOLD_OFF;
    t += "COMPROBANTE DE VENTA\n";
    t += "--------------------------------\n";
    t += this.LEFT + `ID: ${sale.id}\n`;
    t += `FECHA: ${new Date(sale.fecha).toLocaleString()}\n`;
    t += `CLIENTE: ${sale.clientNombre}\n`;
    if (client?.direccion) t += `DIR: ${client.direccion}\n`;
    t += "--------------------------------\n";
    t += "CANT  PRODUCTO           TOTAL\n";
    t += "--------------------------------\n";
    
    sale.items.forEach((item: any) => {
      const nombre = item.nombre.substring(0, 18).padEnd(18, ' ');
      const cant = item.cantidad.toString().padStart(4, ' ');
      const total = `$${item.subtotal.toLocaleString()}`.padStart(8, ' ');
      t += `${cant}  ${nombre} ${total}\n`;
    });
    
    t += "--------------------------------\n";
    t += this.BOLD_ON + `TOTAL: $${sale.total.toLocaleString()}\n` + this.BOLD_OFF;
    t += "--------------------------------\n";
    t += this.CENTER + "¡GRACIAS POR SU COMPRA!\n";
    
    return t;
  }
}

export const printerService = new PrinterService();
